'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl, { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import Topbar from '../UI/Topbar';
import FilterPanel from '../UI/FilterPanel';
import RightControls from '../UI/RightControls';
import StatsPanel from '../UI/StatsPanel';
import PinModal from '../UI/PinModal';
import FlatHuntContent from '../UI/FlatHuntContent';
import OnboardingModal from '../UI/OnboardingModal';
import LocationSearchModal from '../UI/LocationSearchModal';
import MapLoader from '../UI/MapLoader';
import { getMetroLines } from '../../lib/metroData';
import { AREA_LABELS } from '../../lib/areaLabels';

// ── Types ──
export interface RentPin {
  id: string;
  city: string;
  lat: number;
  lng: number;
  bhk: number;
  rent: number;
  furnished: string | null;
  includes_maint: boolean;
  gated: boolean | null;
  society: string;
  note: string | null;
  occupant: string | null;
  deposit_months: number | null;
  pets_allowed: boolean | null;
  sqft: number | null;
  ip_hash: string;
  report_count: number;
  available: boolean;
  available_from: string | null;
  flatmate_wanted: boolean;
  created_at: string;
  ratings?: { avgLocality: number | null; avgQuality: number | null; count: number };
  category?: string;
  sub_type?: string;
}

export interface Filters {
  bhk: number[];
  minRent: number;
  maxRent: number;
  furnished: string;
  gated: string;
  minRating: number;
  flatmateWanted: boolean;
  neighborhood: string;
  commercialType?: string;
  minArea?: number;
}

interface MapProps {
  city: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

interface StatsData {
  byBhk: Array<{ bhk: number; avg_rent: number; count: number }>;
  total: number;
  addedThisWeek: number;
}

interface AreaStatsData {
  total: number;
  byBhk: Array<{ bhk: number; avg: number; count: number }>;
}

// ── Format helpers ──
function fmtRent(r: number) {
  if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`;
  return `₹${(r / 1000).toFixed(1)}k`;
}

export default function MapLibreMap({ city, centerLat, centerLng, zoom }: MapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Data
  const [pins, setPins] = useState<RentPin[]>([]);
  const [filters, setFilters] = useState<Filters>({
    bhk: [], minRent: 5000, maxRent: 200000, furnished: 'both', gated: 'both',
    minRating: 0, flatmateWanted: false, neighborhood: '',
  });

  // UI state
  const [categoryMode, setCategoryMode] = useState<'residential' | 'commercial'>('residential');
  const [showPinModal, setShowPinModal] = useState(false);
  const [draftPinLatLng, setDraftPinLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(true);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showFlatHunt, setShowFlatHunt] = useState(false);
  const [showMetro, setShowMetro] = useState(true);
  const [showGreen, setShowGreen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [userIpHash, setUserIpHash] = useState<string>('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ pinId: string; locality: number; quality: number } | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
  const [mapReady, setMapReady] = useState(false);

  // Area stats
  const [areaSelectMode, setAreaSelectMode] = useState(false);
  const [areaStats, setAreaStats] = useState<AreaStatsData | null>(null);
  const [, setAreaCorners] = useState<[number, number][]>([]);

  // Refs for layer management
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const draftMarkerRef = useRef<maplibregl.Marker | null>(null);

  // ── Toast helper ──
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Filter logic (Memoized) ──
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      const pinCat = p.category || 'residential';
      if (categoryMode !== pinCat) return false;

      if (categoryMode === 'residential') {
        if (filters.bhk.length > 0 && !filters.bhk.includes(p.bhk)) return false;
        if (filters.furnished !== 'both' && p.furnished !== filters.furnished) return false;
        if (filters.gated === 'true' && !p.gated) return false;
        if (filters.gated === 'false' && p.gated) return false;
        if (filters.flatmateWanted && !p.flatmate_wanted) return false;
        if (filters.minRating > 0 && p.ratings && p.ratings.avgLocality !== null && p.ratings.avgLocality < filters.minRating) return false;
      } else {
        if (filters.commercialType && filters.commercialType !== 'both' && p.sub_type !== filters.commercialType) return false;
        if (filters.minArea && (!p.sqft || p.sqft < filters.minArea)) return false;
      }

      if (p.rent < filters.minRent || p.rent > filters.maxRent) return false;
      return true;
    });
  }, [pins, categoryMode, filters]);

  // ── Transform Pins to GeoJSON ──
  const pinsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredPins.map(p => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { ...p }
    }))
  }), [filteredPins]);

  // ── IP Hash & Load Style ──
  useEffect(() => {
    const savedStyle = localStorage.getItem('map-style') as 'dark' | 'light';
    if (savedStyle) setMapStyle(savedStyle);

    if (!localStorage.getItem('seenOnboarding')) {
      setShowOnboarding(true);
    }
    const stored = localStorage.getItem('ip_hash');
    if (stored) { setUserIpHash(stored); return; }
    fetch('https://api.ipify.org?format=json').then(r => r.json()).then(async (data) => {
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.ip)))).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('ip_hash', hash);
      setUserIpHash(hash);
    }).catch(() => {});
  }, []);

  // ── Fetch pins ──
  const fetchPins = useCallback(async () => {
    try {
      const res = await fetch(`/api/pins?city=${city}`);
      const data = await res.json();
      setPins(Array.isArray(data) ? data : []);
    } catch { setPins([]); }
  }, [city]);

  useEffect(() => { fetchPins(); }, [fetchPins]);

  // ── Fetch stats ──
  useEffect(() => {
    fetch(`/api/stats?city=${city}`).then(r => r.json()).then(setStats).catch(() => {});
  }, [city]);

  // ══════════════════════════════════════
  // MAP INIT & CORE LAYERS
  // ══════════════════════════════════════
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle === 'dark' 
        ? 'https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [centerLng, centerLat],
      zoom: zoom || 12,
    });

    map.on('load', () => {
      setMapReady(true);
      
      // 1. Setup Sources
      map.addSource('pins', {
        type: 'geojson',
        data: pinsGeoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40
      });

      // 2. Cluster Layers
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'pins',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1a1a1a',
          'circle-radius': 18,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'pins',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'pins',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 0, // Hidden, markers will be rendered on top
        }
      });

      // 3. Metro Lines Source & Layer
      const metroLinesData = getMetroLines(city);
      const metroLinesGeoJSON = {
        type: 'FeatureCollection' as const,
        features: metroLinesData.map(line => ({
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: line.stations.map(s => [s.coords[1], s.coords[0]]) // MapLibre [lng,lat]
          },
          properties: { color: line.color }
        }))
      };

      map.addSource('metro-lines', { type: 'geojson', data: metroLinesGeoJSON });
      map.addLayer({
        id: 'metro-lines-layer',
        type: 'line',
        source: 'metro-lines',
        layout: { 
          'line-cap': 'round', 
          'line-join': 'round',
          'visibility': showMetro ? 'visible' : 'none'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 2, 14, 4, 18, 8],
          'line-opacity': 0.8
        }
      });

      // 4. Area Labels Source & Layer
      const areaLabelsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: AREA_LABELS.filter(l => l.city === city).map(label => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [label.coords[1], label.coords[0]] },
          properties: { name: label.name }
        }))
      };

      map.addSource('area-labels', { type: 'geojson', data: areaLabelsGeoJSON });
      map.addLayer({
        id: 'area-labels-layer',
        type: 'symbol',
        source: 'area-labels',
        minzoom: 14,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 14, 12, 16, 16, 18, 20],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto'
        },
        paint: {
          'text-color': '#e0e0e0',
          'text-halo-color': 'rgba(0,0,0,0.8)',
          'text-halo-width': 2
        }
      });

      // 5. Metro Stations layer
      const stationsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: metroLinesData.flatMap(line => line.stations.map(s => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [s.coords[1], s.coords[0]] },
          properties: { name: s.name, color: line.color, isIx: s.interchange === true }
        })))
      };

      map.addSource('metro-stations', { type: 'geojson', data: stationsGeoJSON });
      map.addLayer({
        id: 'metro-stations-layer',
        type: 'circle',
        source: 'metro-stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': ['case', ['get', 'isIx'], 2, 1],
          'circle-stroke-color': '#ffffff'
        }
      });

      // 6. Selection Rect Source
      map.addSource('selection-rect', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'selection-rect-layer',
        type: 'fill',
        source: 'selection-rect',
        paint: { 'fill-color': 'var(--accent)', 'fill-opacity': 0.1 }
      });
      map.addLayer({
        id: 'selection-rect-outline',
        type: 'line',
        source: 'selection-rect',
        paint: { 'line-color': 'var(--accent)', 'line-width': 2 }
      });

      // 4. Click Handlers
      map.on('click', 'clusters', async (e: MapLayerMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features || !features.length) return;
        
        const feature = features[0];
        const clusterId = feature.properties?.cluster_id;
        if (clusterId === undefined) return;

        const source = map.getSource('pins') as GeoJSONSource | undefined;
        if (!source || !source.getClusterExpansionZoom) return;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          if (feature.geometry.type === 'Point') {
            const coords = feature.geometry.coordinates as [number, number];
            map.easeTo({ center: coords, zoom });
          }
        } catch (err) {
          console.error('Cluster zoom error:', err);
        }
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [city, centerLat, centerLng, zoom, mapStyle, showMetro, pinsGeoJSON]); 

  // ── Update Source Data ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const source = mapRef.current.getSource('pins') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(pinsGeoJSON);
    }
  }, [pinsGeoJSON, mapReady]);

  // ── Helper to create popup HTML ──
  const createPopupHtml = useCallback((pin: RentPin) => {
    const isOwner = pin.ip_hash === userIpHash;
    const ratingHtml = pin.ratings && pin.ratings.count > 0
      ? `<div style="display:flex;gap:8px;margin-bottom:10px;font-size:11px;color:var(--text2);">
          <span>📍 Locality: ${pin.ratings.avgLocality?.toFixed(1) ?? '—'}/5</span>
          <span style="color:var(--text3);">(${pin.ratings.count})</span>
        </div>`
      : '';

    return `
      <div style="padding:12px 14px;min-width:260px;font-family:var(--font-outfit),sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div>
            <div style="font-weight:800;font-size:24px;color:var(--text);line-height:1;">${pin.rent.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:4px;">${pin.bhk} BHK · ${pin.furnished || 'Unfurnished'}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
            <div style="background:var(--accent);color:#000;font-size:9px;font-weight:800;padding:3px 6px;border-radius:4px;">${pin.gated ? 'GATED' : 'INDEPENDENT'}</div>
            ${isOwner ? '<div style="background:var(--purple);color:#fff;font-size:8px;font-weight:800;padding:2px 4px;border-radius:3px;">YOUR PIN</div>' : ''}
          </div>
        </div>
        <p style="font-size:14px;color:var(--text2);font-weight:500;margin:0 0 6px;">${pin.society}</p>
        ${ratingHtml}
        <button onclick="window.__interestPin__('${pin.id}')" style="width:100%;background:var(--accent);color:#0f0f0f;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:700;margin-top:10px;">Contact Owner</button>
      </div>
    `;
  }, [userIpHash]);

  // ── Update Pins & Markers ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    const updateMarkers = () => {
      const features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
      
      // Remove old markers
      markersRef.current.forEach(m => { m.remove(); });
      markersRef.current = [];

      features.forEach(f => {
        const pin = f.properties as RentPin;
        const coords = (f.geometry as { type: 'Point'; coordinates: [number, number] }).coordinates;
        
        const el = document.createElement('div');
        el.className = 'custom-pill-marker';
        const isComm = pin.category === 'commercial';
        const color = isComm ? 'var(--purple)' : (pin.gated ? 'var(--pin-gated)' : 'var(--pin-nogated)');
        const price = fmtRent(pin.rent).replace('₹', '');
        const typeLabel = isComm ? (pin.sub_type ? pin.sub_type.charAt(0).toUpperCase() : 'C') : `${pin.bhk}BHK`;
        
        el.innerHTML = `<div style="position:relative;display:flex;align-items:center;background:${color};color:#fff;padding:4px 10px;border-radius:8px;font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,0.45);border:1.5px solid rgba(255,255,255,0.15);white-space:nowrap;transition:all 0.2s ease;pointer-events:auto;cursor:pointer;">
          <span style="opacity:0.85;margin-right:5px;font-size:10px;">${typeLabel}</span>
          <span>${price}</span>
          <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${color};"></div>
        </div>`;

        el.onclick = (e) => {
          e.stopPropagation();
          new maplibregl.Popup({ offset: [0, -15], className: 'dark-popup' })
            .setLngLat(coords)
            .setHTML(createPopupHtml(pin))
            .addTo(map);
        };

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    };

    map.on('render', updateMarkers);
    return () => { map.off('render', updateMarkers); };
  }, [mapReady, pins, createPopupHtml]);

  // ── Update Source ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const source = mapRef.current.getSource('pins') as maplibregl.GeoJSONSource;
    if (source) source.setData(pinsGeoJSON);
  }, [pinsGeoJSON, mapReady]);

  // ── Draft Pin Draggable ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    if (draftPinLatLng && !showPinModal) {
      if (!draftMarkerRef.current) {
        const el = document.createElement('div');
        el.innerHTML = '<div style="font-size: 42px; text-shadow: 0 8px 16px rgba(0,0,0,0.6); transform: translateY(-50%); cursor: grab;">📍</div>';
        
        draftMarkerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([draftPinLatLng.lng, draftPinLatLng.lat])
          .addTo(map);

        draftMarkerRef.current.on('dragend', () => {
          const lngLat = draftMarkerRef.current!.getLngLat();
          setDraftPinLatLng({ lat: lngLat.lat, lng: lngLat.lng });
        });
      } else {
        draftMarkerRef.current.setLngLat([draftPinLatLng.lng, draftPinLatLng.lat]);
      }
    } else {
      if (draftMarkerRef.current) {
        draftMarkerRef.current.remove();
        draftMarkerRef.current = null;
      }
    }
  }, [draftPinLatLng, showPinModal, mapReady]);

  // ── Area Selection Logic ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    if (areaSelectMode) {
      map.getCanvas().style.cursor = 'crosshair';
      
      const onClick = (e: maplibregl.MapMouseEvent) => {
        setAreaCorners(prev => {
          const next = [...prev, [e.lngLat.lng, e.lngLat.lat] as [number, number]];
          if (next.length === 2) {
            // Calculate bounds
            const [minLng, minLat] = [Math.min(next[0][0], next[1][0]), Math.min(next[0][1], next[1][1])];
            const [maxLng, maxLat] = [Math.max(next[0][0], next[1][0]), Math.max(next[0][1], next[1][1])];
            
            // Filter pins in box
            const inArea = filteredPins.filter(p => p.lng >= minLng && p.lng <= maxLng && p.lat >= minLat && p.lat <= maxLat);
            
            // Calculate stats
            const byBhk: Record<number, number[]> = {};
            inArea.forEach(p => {
              if (!byBhk[p.bhk]) byBhk[p.bhk] = [];
              byBhk[p.bhk].push(p.rent);
            });
            const bhkStats = Object.entries(byBhk).map(([bhkStr, rents]) => ({
              bhk: parseInt(bhkStr),
              avg: Math.round(rents.reduce((a, b) => a + b, 0) / rents.length),
              count: rents.length,
            })).sort((a, b) => a.bhk - b.bhk);
            
            setAreaStats({ total: inArea.length, byBhk: bhkStats });
            setAreaSelectMode(false);
            setAreaCorners([]);
            map.getCanvas().style.cursor = '';
            
            // Draw rectangle (temporary)
            const sourceRect = map.getSource('selection-rect') as maplibregl.GeoJSONSource;
            if (sourceRect) {
              sourceRect.setData({
                type: 'Feature' as const,
                geometry: {
                  type: 'Polygon' as const,
                  coordinates: [[
                    [minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat]
                  ]]
                },
                properties: {}
              });
            }
          }
          return next;
        });
      };

      map.on('click', onClick);
      return () => { map.off('click', onClick); map.getCanvas().style.cursor = ''; };
    }
  }, [areaSelectMode, filteredPins, mapReady]);

  // ── flyTo City ──
  useEffect(() => {
    if (mapRef.current) mapRef.current.flyTo({ center: [centerLng, centerLat], zoom, duration: 1500 });
  }, [city, centerLat, centerLng, zoom]);

  // ── Style Swap ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const styleUrl = mapStyle === 'dark' 
      ? 'https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
    mapRef.current.setStyle(styleUrl);
    localStorage.setItem('map-style', mapStyle);
  }, [mapStyle, mapReady]);

  // ── Handlers ──
  const handleLocate = () => {
    if (!mapRef.current) return;
    if ('geolocation' in navigator) {
      showToast('Locating...');
      navigator.geolocation.getCurrentPosition(
        (pos) => { 
          mapRef.current!.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 }); 
          showToast('Found you!'); 
        },
        () => { 
          mapRef.current!.flyTo({ center: [centerLng, centerLat], zoom }); 
          showToast("GPS missed."); 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else mapRef.current.flyTo({ center: [centerLng, centerLat], zoom });
  };

  const handlePinSubmit = async (data: Record<string, unknown>) => {
    if (!draftPinLatLng) return;
    try {
      await fetch('/api/pins', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ city, lat: draftPinLatLng.lat, lng: draftPinLatLng.lng, ip_hash: userIpHash, ...data }) 
      });
      showToast('Pin dropped! 📍'); 
      fetchPins();
    } catch { showToast('Add failed.'); }
    setShowPinModal(false); 
    setDraftPinLatLng(null);
  };

  const submitRating = async () => {
    if (!ratingModal) return;
    try {
      await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin_id: ratingModal.pinId, locality: ratingModal.locality, quality: ratingModal.quality }),
      });
      showToast('Rating submitted!');
      fetchPins();
    } catch { showToast('Rating noted.'); }
    setRatingModal(null);
  };

  // ── Global Handlers for Popup Buttons ──
  useEffect(() => {
    const w = window as { 
      __ratePin__?: (id: string) => void;
      __reportPin__?: (id: string) => void;
      __interestPin__?: (id: string) => void;
      confirm: (msg: string) => boolean;
      open: (url: string, target: string) => void;
    };
    w.__ratePin__ = (pinId: string) => { setRatingModal({ pinId, locality: 0, quality: 0 }); };
    w.__reportPin__ = async (id: string) => {
      try {
        await fetch('/api/pins/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report' }) });
        showToast('Pin reported.');
        fetchPins();
      } catch { showToast('Failed to report.'); }
    };
    w.__interestPin__ = async (id: string) => {
      if (!w.confirm('Connect with owner?')) return;
      try {
        const res = await fetch(`/api/pins/${id}/reveal`, { method: 'POST' });
        const resData = await res.json();
        if (!res.ok) { showToast(resData.error || 'Error.'); return; }
        w.open(`https://wa.me/91${resData.phone}`, '_blank');
      } catch { showToast('Error.'); }
    };
  }, [fetchPins, showToast]);

  // ── Layer Toggles ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;
    
    // Metro
    const metroLayers = ['metro-lines-layer', 'metro-stations-layer'];
    metroLayers.forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', showMetro ? 'visible' : 'none');
    });

    // Green Cover
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', showGreen ? 'visible' : 'none');
    } else if (showGreen) {
      map.addSource('google-satellite', {
        type: 'raster',
        tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2'],
        tileSize: 256
      });
      map.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'google-satellite',
        layout: { 'visibility': 'visible' }
      }, 'clusters');
    }
  }, [showMetro, showGreen, mapReady]);

  return (
    <div className="relative w-full h-screen bg-bg overflow-hidden" data-theme={mapStyle}>
      <div ref={mapContainerRef} className="absolute inset-0 z-[100]" />
      <MapLoader isReady={mapReady} />

      {/* Category Toggle */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-[2000] glass px-1.5 py-1.5 rounded-2xl flex gap-1 shadow-2xl pointer-events-auto border border-border1 animate-[popup-enter_0.3s_ease]">
        <button onClick={() => setCategoryMode('residential')} className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${categoryMode === 'residential' ? 'bg-accent text-on-accent shadow-md' : 'text-text3 hover:text-text2'}`}>Residential</button>
        <button onClick={() => setCategoryMode('commercial')} className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${categoryMode === 'commercial' ? 'bg-purple text-white shadow-md' : 'text-text3 hover:text-text2'}`}>Commercial</button>
      </div>

      <Topbar city={city} stats={stats || undefined} onToggleFilter={() => setShowFilterSidebar(!showFilterSidebar)} showFilters={showFilterSidebar} onSelectLocation={(l1, l2) => mapRef.current?.flyTo({ center: [l2, l1], zoom: 16 })} />

      {/* Filter Sidebar */}
      <div className={`fixed top-[84px] left-4 bottom-10 w-[260px] z-[1500] glass rounded-2xl overflow-y-auto transition-transform duration-300 ${showFilterSidebar ? 'translate-x-0' : '-translate-x-[300px]'}`}>
        <FilterPanel filters={filters} setFilters={setFilters} city={city} categoryMode={categoryMode} />
      </div>

      {/* Controls */}
      <RightControls onLocate={handleLocate} onHunt={() => setShowFlatHunt(true)} onStats={() => setShowStatsPanel(!showStatsPanel)} onAreaStats={() => { setAreaSelectMode(true); showToast('Click 2 corners on map.'); }} onToggleMetro={() => setShowMetro(!showMetro)} showMetro={showMetro} onToggleGreen={() => setShowGreen(!showGreen)} showGreen={showGreen} onToggleStyle={() => setMapStyle(p => p === 'dark' ? 'light' : 'dark')} mapStyle={mapStyle} onHelp={() => setShowOnboarding(true)} />

      {/* Floating Bottom CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none w-full flex justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl pointer-events-auto shadow-2xl flex items-center gap-3 border border-border1 animate-[fade-in_0.5s_ease]">
             <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
             <span className="font-syn font-bold text-[11px] text-text1 uppercase tracking-widest">{pins.length} LIVE RENTS</span>
             <div className="w-[1px] h-3 bg-border2" />
             <button onClick={() => setShowLocationSearch(true)} className="text-accent font-syn font-extrabold text-[11px] uppercase">Pin Your Rent 📍</button>
          </div>

          <button onClick={() => setShowFlatHunt(true)} className="glass px-6 py-4 rounded-2xl flex items-center gap-4 group pointer-events-auto shadow-2xl border border-border2 hover:border-accent transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-on-accent text-xl">🏠</div>
            <div className="flex flex-col items-start min-w-[180px]">
              <span className="text-text1 font-syn font-extrabold text-xs uppercase tracking-widest">Find Flat or Tenants</span>
              <span className="text-text3 font-dm text-[11px]">Click to drop a seeker pin</span>
            </div>
          </button>
        </div>
      </div>

      {showStatsPanel && <StatsPanel stats={stats} city={city} onClose={() => setShowStatsPanel(false)} />}
      {showPinModal && draftPinLatLng && <PinModal lat={draftPinLatLng.lat} lng={draftPinLatLng.lng} onClose={() => setShowPinModal(false)} onSubmit={handlePinSubmit} />}
      {showFlatHunt && <FlatHuntContent city={city} onClose={() => setShowFlatHunt(false)} onSubmitSeeker={() => { setShowFlatHunt(false); showToast('Match profile saved!'); fetchPins(); }} />}
      {toastMessage && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] glass rounded-xl px-6 py-3 text-text1 font-syn font-bold text-sm shadow-2xl animate-[popup-enter_0.2s_ease]">{toastMessage}</div>}
      {showLocationSearch && <LocationSearchModal city={city} onClose={() => setShowLocationSearch(false)} onSelect={(lat, lng) => { mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 }); setDraftPinLatLng({ lat, lng }); setShowLocationSearch(false); }} />}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRatingModal(null)}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Rate listing</h3>
               {[
                 {label:'📍 Locality', field: 'locality'}, {label:'🏗 Built Quality', field: 'quality'} 
               ].map((item) => (
                <div key={item.field}>
                  <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">{item.label}</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button 
                        key={n} 
                        onClick={() => { setRatingModal(prev => prev ? { ...prev, [item.field as 'locality' | 'quality']: n } : null); }} 
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${ratingModal && (ratingModal as Record<string, unknown>)[item.field] as number >= n ? 'bg-accent text-bg border-accent shadow-lg scale-105' : 'border-border2 text-text3 opacity-50'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            <button onClick={submitRating} className="w-full py-3 bg-accent text-bg font-syn font-extrabold uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] shadow-lg">Submit</button>
          </div>
        </div>
      )}

      {/* Area Stats Modal */}
      {areaStats && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setAreaStats(null); if (mapRef.current) { const s = mapRef.current.getSource('selection-rect') as maplibregl.GeoJSONSource; if (s) s.setData({ type: 'FeatureCollection', features: [] }); } }}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Area Stats</h3><button onClick={() => { setAreaStats(null); if (mapRef.current) { const s = mapRef.current.getSource('selection-rect') as maplibregl.GeoJSONSource; if (s) s.setData({ type: 'FeatureCollection', features: [] }); } }} className="text-text3 text-xl">✕</button></div>
            <div className="flex items-end gap-2"><span className="font-syn font-extrabold text-3xl text-text1">{areaStats.total}</span><span className="text-text3 text-xs mb-1 uppercase tracking-wider">pins in area</span></div>
            <div className="space-y-2">
              {areaStats.byBhk.map((s: { bhk: number; count: number; avg: number }) => (
                <div key={s.bhk} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border1">
                  <span className="font-syn text-sm font-bold text-text2 uppercase tracking-tight">{s.bhk} BHK <span className="text-text3 font-normal">({s.count})</span></span>
                  <span className="font-syn text-lg font-extrabold text-accent">{fmtRent(s.avg)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
