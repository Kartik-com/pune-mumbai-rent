'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

interface LeafletMapProps {
  city: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

// ── Format helpers ──
function fmtRent(r: number) {
  if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`;
  return `₹${(r / 1000).toFixed(1)}k`;
}

// ── Pin Icon (Cyber Price Pill Style) ──
function createPinIcon(pin: RentPin): L.DivIcon {
  const isComm = pin.category === 'commercial';
  const color = isComm ? 'var(--purple)' : (pin.gated ? 'var(--pin-gated)' : 'var(--pin-nogated)');
  const price = fmtRent(pin.rent).replace('₹', '');
  const typeLabel = isComm ? (pin.sub_type ? pin.sub_type.charAt(0).toUpperCase() : 'C') : `${pin.bhk}BHK`;
  
  const rating = pin.ratings && pin.ratings.count > 0 && pin.ratings.avgLocality !== null ? `<span style="margin-left:4px;color:rgba(255,255,255,0.7);font-size:9px;">★${pin.ratings.avgLocality.toFixed(1)}</span>` : '';
  
  let badge = '';
  if (pin.available) {
    badge = `<div style="position:absolute;top:-6px;right:-4px;background:var(--green);color:#0f0f0f;font-size:6px;font-weight:900;padding:1px 3px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);z-index:10;">AVLB</div>`;
  } else if (pin.flatmate_wanted) {
    badge = `<div style="position:absolute;top:-6px;right:-4px;background:var(--teal);color:#0f0f0f;font-size:6px;font-weight:900;padding:1px 3px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);z-index:10;">ROOM</div>`;
  }

  return L.divIcon({
    className: 'custom-pill-marker',
    html: `<div style="position:relative;display:flex;align-items:center;background:${color};color:#fff;padding:4px 10px;border-radius:8px;font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,0.45);border:1.5px solid rgba(255,255,255,0.15);white-space:nowrap;transition:all 0.2s ease;">
      <span style="opacity:0.85;margin-right:5px;font-size:10px;">${typeLabel}</span>
      <span>${price}</span>
      ${rating}
      ${badge}
      <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${color};"></div>
    </div>`,
    iconSize: [60, 26],
    iconAnchor: [30, 26],
    popupAnchor: [0, -28],
  });
}

// ── Cluster Icon (High Contrast Dark) ──
const createClusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div>${count}</div>`,
    className: 'marker-cluster marker-cluster-glass',
    iconSize: L.point(34, 34),
  });
};

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
export default function LeafletMap({ city, centerLat, centerLng, zoom }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const metroLayerRef = useRef<L.LayerGroup | null>(null);
  const greenLayerRef = useRef<L.TileLayer | null>(null);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ pinId: string; locality: number; quality: number } | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
  const [mapReady, setMapReady] = useState(false);

  // Area stats
  const [areaSelectMode, setAreaSelectMode] = useState(false);
  const [, setAreaCorners] = useState<L.LatLng[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [areaStats, setAreaStats] = useState<any>(null);
  const areaRectRef = useRef<L.Rectangle | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);

  // ── Toast helper ──
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── IP Hash & Load Style ──
  useEffect(() => {
    const savedStyle = localStorage.getItem('map-style') as 'dark' | 'light';
    if (savedStyle) setMapStyle(savedStyle);

    if (!localStorage.getItem('has_seen_onboarding')) {
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
  // MAP INIT
  // ══════════════════════════════════════
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng], zoom, zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer(mapStyle === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    map.whenReady(() => {
      setTimeout(() => setMapReady(true), 150);
    });

    // Marker cluster
    clusterGroupRef.current = L.markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });
    map.addLayer(clusterGroupRef.current!);

    // Click to pin
    map.on('click', (e) => {
      if (areaSelectMode) return;
      setDraftPinLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowPinModal(false);
    });

    // ── Metro Lines ──
    metroLayerRef.current = L.layerGroup().addTo(map);
    const metroLines = getMetroLines(city);
    metroLines.forEach((line) => {
      const coords = line.stations.map(s => s.coords);
      L.polyline(coords, {
        color: line.color, weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round',
      }).addTo(metroLayerRef.current!);

      line.stations.forEach((station) => {
        const isIx = station.interchange === true;
        L.circleMarker(station.coords, {
          radius: isIx ? 8 : 5,
          color: isIx ? '#ffffff' : line.color,
          weight: isIx ? 3 : 2,
          fillColor: '#0f0f0f',
          fillOpacity: 1,
        }).bindTooltip(isIx ? `⬡ ${station.name} — Interchange` : station.name, {
          direction: 'top', offset: [0, -8], className: 'metro-tooltip',
        }).addTo(metroLayerRef.current!);
      });
    });

    // ── Green Cover Layer ──
    greenLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      opacity: 0.35, maxZoom: 18, attribution: 'ESRI'
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fly to City ──
  useEffect(() => {
    if (mapRef.current) mapRef.current.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom]);

  // ── Swap Tiles ──
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && layer !== greenLayerRef.current) {
        mapRef.current!.removeLayer(layer);
      }
    });

    const url = mapStyle === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(url, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(mapRef.current);

    localStorage.setItem('map-style', mapStyle);
  }, [mapStyle]);

  // ── Refresh Metro on City Change ──
  useEffect(() => {
    if (!mapRef.current || !metroLayerRef.current) return;
    metroLayerRef.current.clearLayers();

    const metroLines = getMetroLines(city);
    metroLines.forEach((line) => {
      const coords = line.stations.map(s => s.coords);
      L.polyline(coords, {
        color: line.color, weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round',
      }).addTo(metroLayerRef.current!);

      line.stations.forEach((station) => {
        const isIx = station.interchange === true;
        L.circleMarker(station.coords, {
          radius: isIx ? 8 : 5,
          color: isIx ? '#ffffff' : line.color,
          weight: isIx ? 3 : 2,
          fillColor: '#0f0f0f',
          fillOpacity: 1,
        }).bindTooltip(isIx ? `⬡ ${station.name} — Interchange` : station.name, {
          direction: 'top', offset: [0, -8], className: 'metro-tooltip',
        }).addTo(metroLayerRef.current!);
      });
    });
  }, [city]);

  // ── Draft Pin Draggable ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (draftPinLatLng && !showPinModal) {
      if (!draftMarkerRef.current) {
        const icon = L.divIcon({
          className: 'custom-pin-marker',
          html: `<div style="font-size: 42px; text-shadow: 0 8px 16px rgba(0,0,0,0.6); transform: translateY(-50%);">📍</div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        draftMarkerRef.current = L.marker([draftPinLatLng.lat, draftPinLatLng.lng], {
          icon,
          draggable: true,
          zIndexOffset: 2000,
        }).addTo(mapRef.current);

        draftMarkerRef.current.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          setDraftPinLatLng({ lat: latlng.lat, lng: latlng.lng });
        });
      } else {
        draftMarkerRef.current.setLatLng([draftPinLatLng.lat, draftPinLatLng.lng]);
      }
    } else {
      if (draftMarkerRef.current) {
        mapRef.current.removeLayer(draftMarkerRef.current);
        draftMarkerRef.current = null;
      }
    }
  }, [draftPinLatLng, showPinModal]);

  // ── Toggle Extra Layers ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (metroLayerRef.current) {
      if (showMetro) mapRef.current.addLayer(metroLayerRef.current);
      else mapRef.current.removeLayer(metroLayerRef.current);
    }
    if (greenLayerRef.current) {
      if (showGreen) mapRef.current.addLayer(greenLayerRef.current);
      else mapRef.current.removeLayer(greenLayerRef.current);
    }
  }, [showMetro, showGreen]);

  // ── Filter logic ──
  const filteredPins = pins.filter((p) => {
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

  // ── Render Markers Effect ──
  useEffect(() => {
    if (!clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();

    filteredPins.forEach((pin: RentPin) => {
      const icon = createPinIcon(pin);
      const marker = L.marker([pin.lat, pin.lng], { icon });

      const isOwner = pin.ip_hash === userIpHash;
      const ratingHtml = pin.ratings && pin.ratings.count > 0
        ? `<div style="display:flex;gap:8px;margin-bottom:10px;font-size:11px;color:var(--text2);">
            <span>📍 Locality: ${pin.ratings.avgLocality?.toFixed(1) ?? '—'}/5</span>
            <span>🏗 Quality: ${pin.ratings.avgQuality?.toFixed(1) ?? '—'}/5</span>
            <span style="color:var(--text3);">(${pin.ratings.count})</span>
          </div>`
        : '';

      const popupHtml = `
        <div style="padding:12px 14px;min-width:260px;font-family:var(--font-outfit),sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
            <div>
              <div style="font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:28px;color:var(--text);line-height:1;">${pin.rent.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:4px;">
                ${pin.category === 'commercial' ? `<span style="text-transform:capitalize;color:var(--purple);font-weight:bold;">${pin.sub_type || 'Commercial'}</span> · ` : ''}
                ${pin.category === 'commercial' ? (pin.sqft ? `${pin.sqft} sqft` : '') : `${pin.bhk} BHK`}
                ${pin.category !== 'commercial' ? ` · ${pin.furnished || 'Unfurnished'}` : ''}
                ${pin.includes_maint ? ' · +Maint' : ''}
              </div>
            </div>
              <div style="background:${pin.category === 'commercial' ? 'var(--purple)' : (pin.gated ? 'var(--pin-gated)' : 'var(--pin-nogated)')};color:#0f0f0f;font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:9px;padding:4px 8px;border-radius:6px;letter-spacing:1px;text-transform:uppercase;">${pin.category === 'commercial' ? 'Commercial' : (pin.gated ? 'Gated' : 'Independent')}</div>
          </div>

          <p style="font-size:14px;color:var(--text2);font-weight:500;margin:0 0 6px;">${pin.society}</p>
          ${pin.note ? `<p style="font-size:12px;color:var(--text3);font-style:italic;margin:0 0 10px;">"${pin.note}"</p>` : ''}

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
            ${pin.deposit_months ? `<span style="background:var(--surface3);color:var(--text2);padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;">Deposit: ${pin.deposit_months} mo</span>` : ''}
            ${pin.sqft ? `<span style="background:var(--surface3);color:var(--text2);padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;">${pin.sqft} sqft</span>` : ''}
            ${pin.pets_allowed ? `<span style="background:var(--surface3);color:var(--pink);padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;">🐾 Pets OK</span>` : ''}
            ${pin.occupant ? `<span style="background:var(--surface3);color:var(--text2);padding:3px 8px;border-radius:6px;font-size:10px;font-weight:600;">${pin.occupant}</span>` : ''}
          </div>

          ${pin.available ? `<div style="background:rgba(62,200,122,0.15);color:var(--green);padding:6px 10px;border-radius:8px;font-size:11px;text-align:center;margin-bottom:10px;font-weight:600;">🏠 Available${pin.available_from ? ` — ${pin.available_from.replace(/_/g, ' ')}` : ''}</div>` : ''}

          ${ratingHtml}

          <div style="display:flex;gap:6px;margin-top:4px;">
            <button onclick="window.__ratePin__('${pin.id}')" style="flex:1;background:var(--surface3);color:var(--accent);border:1px solid var(--border);padding:7px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;">⭐ Rate</button>
            <button onclick="window.__interestPin__('${pin.id}')" style="flex:1;background:var(--accent);color:#0f0f0f;border:none;padding:7px;border-radius:8px;cursor:pointer;font-weight:700;font-size:11px;">Interested</button>
            <button onclick="window.__reportPin__('${pin.id}')" style="background:var(--surface3);color:var(--text3);border:1px solid var(--border);padding:7px 10px;border-radius:8px;cursor:pointer;font-size:11px;">🚩</button>
            <button onclick="window.__sharePin__('${pin.id}','${pin.bhk}','${pin.rent}','${encodeURIComponent(pin.society)}')" style="background:var(--surface3);color:var(--text3);border:1px solid var(--border);padding:7px 10px;border-radius:8px;cursor:pointer;font-size:11px;">📤</button>
          </div>

          ${isOwner ? `<button onclick="window.__deletePin__('${pin.id}')" style="width:100%;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:7px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;margin-top:8px;">🗑 Delete your pin</button>` : ''}

          <div style="font-size:10px;color:var(--text3);text-align:right;margin-top:8px;">${new Date(pin.created_at).toLocaleDateString('en-IN')}</div>
        </div>
      `;

      marker.bindPopup(popupHtml, { minWidth: 280, maxWidth: 320, className: 'dark-popup' });
      clusterGroupRef.current!.addLayer(marker);
    });
  }, [filteredPins, userIpHash]);

  // ── Global Handlers for Popup Buttons ──
  useEffect(() => {
    const w = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    w.__ratePin__ = (pinId: string) => setRatingModal({ pinId, locality: 0, quality: 0 });
    w.__reportPin__ = async (id: string) => {
      try {
        await fetch('/api/pins/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report' }) });
        showToast('Pin reported. Community-moderated.');
        fetchPins();
      } catch { showToast('Failed to report.'); }
    };
    w.__interestPin__ = async (id: string) => {
      if (!confirm('Instantly connect with the owner on WhatsApp? (Secure reveal: max 5 per day)')) return;
      try {
        const res = await fetch(`/api/pins/${id}/reveal`, { method: 'POST' });
        const data = await res.json();
        if (res.status === 429) { showToast(data.error || 'Rate limit reached.'); return; }
        if (!res.ok) { showToast(data.error || 'No contact found.'); return; }
        const bhkStr = data.category === 'commercial' ? data.sub_type : `${data.bhk}BHK`;
        const text = `Hi! I saw your ${bhkStr} at ${data.society} for ₹${data.rent.toLocaleString('en-IN')}/mo on the map. Is it still available?`;
        window.open(`https://wa.me/91${data.phone}?text=${encodeURIComponent(text)}`, '_blank');
        showToast(`Success! ${data.revealsRemaining} reveals left today.`);
      } catch { showToast('Error connecting to WhatsApp.'); }
    };
    w.__sharePin__ = (_id: string, bhk: string, rent: string, society: string) => {
      const text = `Check this ${bhk}BHK at ${decodeURIComponent(society)} for ₹${parseInt(rent).toLocaleString('en-IN')}/mo on ${city}.rent`;
      if (navigator.share) navigator.share({ title: `${city}.rent`, text, url: window.location.href });
      else { navigator.clipboard.writeText(text + ' — ' + window.location.href); showToast('Link copied!'); }
    };
    w.__deletePin__ = async (id: string) => {
      if (!confirm('Delete this pin?')) return;
      try {
        await fetch('/api/pins/' + id, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip_hash: userIpHash }) });
        showToast('Pin deleted.'); fetchPins();
      } catch { showToast('Delete failed.'); }
    };
  }, [fetchPins, showToast, city, userIpHash]);

  // ── Area Stats Logic ──
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (areaSelectMode) {
      map.getContainer().style.cursor = 'crosshair';
      const handler = (e: L.LeafletMouseEvent) => {
        setAreaCorners(prev => {
          const next = [...prev, e.latlng];
          if (next.length === 2) {
            const bounds = L.latLngBounds(next[0], next[1]);
            if (areaRectRef.current) map.removeLayer(areaRectRef.current);
            areaRectRef.current = L.rectangle(bounds, { color: 'var(--accent)', weight: 2, fillOpacity: 0.1 }).addTo(map);
            const inArea = pins.filter(p => bounds.contains(L.latLng(p.lat, p.lng)));
            const byBhk: Record<number, number[]> = {};
            let gatedCount = 0;
            inArea.forEach(p => {
              if (!byBhk[p.bhk]) byBhk[p.bhk] = [];
              byBhk[p.bhk].push(p.rent);
              if (p.gated) gatedCount++;
            });
            const bhkStats = Object.entries(byBhk).map(([bhk, rents]) => ({
              bhk: parseInt(bhk),
              avg: Math.round(rents.reduce((a, b) => a + b, 0) / rents.length),
              count: rents.length,
            })).sort((a, b) => a.bhk - b.bhk);
            setAreaStats({ total: inArea.length, byBhk: bhkStats, gatedPercent: inArea.length > 0 ? Math.round((gatedCount / inArea.length) * 100) : 0 });
            setAreaSelectMode(false); map.getContainer().style.cursor = '';
            return [];
          }
          return next;
        });
      };
      map.on('click', handler);
      return () => { map.off('click', handler); };
    }
  }, [areaSelectMode, pins]);

  const handlePinSubmit = async (data: Record<string, unknown>) => {
    if (!draftPinLatLng) return;
    try {
      await fetch('/api/pins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, lat: draftPinLatLng.lat, lng: draftPinLatLng.lng, ip_hash: userIpHash, ...data }) });
      showToast('Pin dropped! 📍'); fetchPins();
    } catch { showToast('Add failed.'); }
    setShowPinModal(false); setDraftPinLatLng(null);
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

  const handleLocate = () => {
    if (!mapRef.current) return;
    if ('geolocation' in navigator) {
      showToast('Locating...');
      navigator.geolocation.getCurrentPosition(
        (pos) => { mapRef.current!.flyTo([pos.coords.latitude, pos.coords.longitude], 15); showToast('Found you!'); },
        () => { mapRef.current!.flyTo([centerLat, centerLng], zoom); showToast("GPS missed, moving to center."); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else mapRef.current.flyTo([centerLat, centerLng], zoom);
  };

  return (
    <div className="relative w-full h-screen bg-bg overflow-hidden" data-theme={mapStyle}>
      <div ref={mapContainerRef} className="absolute inset-0 z-[100]" />
      <MapLoader isReady={mapReady} />

      {/* Category Toggle */}
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 z-[2000] glass px-1.5 py-1.5 rounded-2xl flex gap-1 shadow-2xl pointer-events-auto border border-border1">
        <button onClick={() => setCategoryMode('residential')} className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${categoryMode === 'residential' ? 'bg-accent text-on-accent shadow-md' : 'text-text3 hover:text-text2'}`}>Residential</button>
        <button onClick={() => setCategoryMode('commercial')} className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${categoryMode === 'commercial' ? 'bg-purple text-white shadow-md' : 'text-text3 hover:text-text2'}`}>Commercial</button>
      </div>

      <Topbar city={city} stats={stats} onToggleFilter={() => setShowFilterSidebar(!showFilterSidebar)} showFilters={showFilterSidebar} onSelectLocation={(l1, l2) => mapRef.current?.flyTo([l1, l2], 16)} />

      {/* Filter Sidebar */}
      <div className={`fixed top-[84px] left-4 bottom-10 w-[260px] z-[1500] glass rounded-2xl overflow-y-auto transition-transform duration-300 ${showFilterSidebar ? 'translate-x-0' : '-translate-x-[300px]'}`}>
        <FilterPanel filters={filters} setFilters={setFilters} city={city} categoryMode={categoryMode} />
      </div>

      {/* Controls */}
      <RightControls onLocate={handleLocate} onHunt={() => setShowFlatHunt(true)} onStats={() => setShowStatsPanel(!showStatsPanel)} onAreaStats={() => { setAreaSelectMode(true); setAreaCorners([]); setAreaStats(null); showToast('Click 2 corners on map.'); }} onToggleMetro={() => setShowMetro(!showMetro)} showMetro={showMetro} onToggleGreen={() => setShowGreen(!showGreen)} showGreen={showGreen} onToggleStyle={() => setMapStyle(p => p === 'dark' ? 'light' : 'dark')} mapStyle={mapStyle} />

      {/* Floating Bottom CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none w-full flex justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl pointer-events-auto shadow-2xl flex items-center gap-3 border border-border1 animate-[fade-in_0.5s_ease]">
             <span className="w-2 h-2 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(62,200,122,0.6)]" />
             <span className="font-syn font-bold text-[11px] text-text1 whitespace-nowrap tracking-widest uppercase">{filteredPins.length.toLocaleString()} LIVE RENTS</span>
             <div className="w-[1px] h-3 bg-border2" />
             <button onClick={() => setShowLocationSearch(true)} className="text-accent hover:text-white transition-colors font-syn font-extrabold text-[11px] uppercase tracking-tighter">Pin Your Rent 📍</button>
          </div>

          <button onClick={() => setShowFlatHunt(true)} className="glass px-6 py-4 rounded-2xl flex items-center gap-4 group pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-[popup-enter_0.4s_ease] border border-border2 hover:border-accent transition-all active:scale-95 bg-bg/40">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-on-accent text-xl shadow-lg">🏠</div>
            <div className="flex flex-col items-start min-w-[180px]">
              <span className="text-text1 font-syn font-extrabold text-xs uppercase tracking-widest">Find Flat or Tenants</span>
              <span className="text-text3 font-dm text-[11px]">Click to drop a seeker pin or match</span>
            </div>
            <div className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-text2 group-hover:text-accent transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </button>
        </div>
      </div>

      {showStatsPanel && <StatsPanel stats={stats} city={city} onClose={() => setShowStatsPanel(false)} />}
      
      {draftPinLatLng && !showPinModal && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[2000] glass px-4 py-4 rounded-2xl flex flex-col items-center gap-3 w-max shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-[popup-enter_0.2s_ease]">
          <div className="text-text1 font-syn font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
             Drag pin to adjust location
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDraftPinLatLng(null)} className="px-4 py-2 bg-surface2 text-text3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-border1">Cancel</button>
            <button onClick={() => setShowPinModal(true)} className="px-6 py-2 bg-accent text-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">Confirm ➔</button>
          </div>
        </div>
      )}

      {showPinModal && draftPinLatLng && <PinModal lat={draftPinLatLng.lat} lng={draftPinLatLng.lng} onClose={() => setShowPinModal(false)} onSubmit={handlePinSubmit} />}
      {showFlatHunt && <FlatHuntContent city={city} onClose={() => setShowFlatHunt(false)} onSubmitSeeker={() => { setShowFlatHunt(false); showToast('Match profile saved!'); fetchPins(); }} />}

      {toastMessage && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] glass rounded-xl px-6 py-3 text-text1 font-syn font-bold text-sm shadow-2xl animate-[popup-enter_0.2s_ease]">{toastMessage}</div>}

      {ratingModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRatingModal(null)}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Rate listing</h3>
              {[ {label:'📍 Locality', field: 'locality'}, {label:'🏗 Built Quality', field: 'quality'} ].map((item: {label:string, field:string}) => (
                <div key={item.field}>
                  <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">{item.label}</label>
                  <div className="flex gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {[1,2,3,4,5].map(n => <button key={n} onClick={() => setRatingModal({ ...ratingModal!, [item.field as 'locality' | 'quality']: n })} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${(ratingModal as any)[item.field] >= n ? 'bg-accent text-bg border-accent shadow-lg scale-105' : 'border-border2 text-text3 opacity-50'}`}>{n}</button>)}
                  </div>
                </div>
              ))}
            <button onClick={submitRating} className="w-full py-3 bg-accent text-bg font-syn font-extrabold uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] shadow-lg">Submit</button>
          </div>
        </div>
      )}

      {areaStats && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setAreaStats(null); if (areaRectRef.current && mapRef.current) mapRef.current.removeLayer(areaRectRef.current); }}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center"><h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Area Stats</h3><button onClick={() => { setAreaStats(null); if (areaRectRef.current && mapRef.current) mapRef.current.removeLayer(areaRectRef.current); }} className="text-text3 text-xl">✕</button></div>
            <div className="flex items-end gap-2"><span className="font-syn font-extrabold text-3xl text-text1">{areaStats.total}</span><span className="text-text3 text-xs mb-1 uppercase tracking-wider">pins in area</span></div>
            <div className="space-y-2">
              {areaStats.byBhk.map((s: { bhk: number; avg: number; count: number }) => (
                <div key={s.bhk} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border1">
                  <span className="font-syn text-sm font-bold text-text2 uppercase tracking-tight">{s.bhk} BHK <span className="text-text3 font-normal">({s.count})</span></span>
                  <span className="font-syn text-lg font-extrabold text-accent">{fmtRent(s.avg)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLocationSearch && <LocationSearchModal city={city} onClose={() => setShowLocationSearch(false)} onSelect={(lat, lng) => { mapRef.current?.flyTo([lat, lng], 17); setDraftPinLatLng({ lat, lng }); setShowLocationSearch(false); }} />}
      {showOnboarding && <OnboardingModal onClose={() => { setShowOnboarding(false); localStorage.setItem('has_seen_onboarding', 'true'); }} />}
    </div>
  );
}
