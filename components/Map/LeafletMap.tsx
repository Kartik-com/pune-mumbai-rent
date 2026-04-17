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

// ── Pin Icon ──
function createPinIcon(gated: boolean | null, available: boolean = false, flatmateWanted: boolean = false, category: string = 'residential'): L.DivIcon {
  const isComm = category === 'commercial';
  const color = isComm ? 'var(--purple)' : (gated ? 'var(--pin-gated)' : 'var(--pin-nogated)');
  const innerHtml = isComm ? `<span style="position:absolute;z-index:3;font-size:12px;transform:translateY(-1px);">💼</span>` : `<div style="position:absolute;width:8px;height:8px;background:#0f0f0f;border-radius:50%;z-index:2;"></div>`;

  let badge = '';
  if (available) {
    badge = `<div style="position:absolute;top:-8px;right:-4px;background:var(--green);color:#0f0f0f;font-size:7px;font-weight:800;padding:1px 4px;border-radius:3px;letter-spacing:0.5px;box-shadow:0 1px 4px rgba(0,0,0,0.4);">AVAIL</div>`;
  } else if (flatmateWanted) {
    badge = `<div style="position:absolute;top:-8px;right:-4px;background:var(--teal);color:#0f0f0f;font-size:7px;font-weight:800;padding:1px 4px;border-radius:3px;letter-spacing:0.5px;box-shadow:0 1px 4px rgba(0,0,0,0.4);">ROOM</div>`;
  }
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:26px;height:26px;background:${color};border-radius:10px 10px 10px 2px;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.35);border:1.5px solid rgba(255,255,255,0.15);"></div>
      ${innerHtml}
      ${badge}
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 40],
    popupAnchor: [0, -36],
  });
}

// ── Cluster Icon ──
const createClusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div>${count}</div>`,
    className: 'marker-cluster marker-cluster-glass',
    iconSize: L.point(44, 44),
  });
};

// ── Format helpers ──
function fmtRent(r: number) {
  if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`;
  return `₹${(r / 1000).toFixed(1)}k`;
}

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

  // ── IP Hash & Onboarding ──
  useEffect(() => {
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

    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Fade out loader when tiles start loading or map is ready
    map.whenReady(() => {
      // Very small delay to ensure first tiles have a frame to render
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

    // ── Metro Lines (coordinate-based Leaflet primitives, per city) ──
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

    // ── Green Cover Layer (Simulated via ESRI imagery) ──
    greenLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      opacity: 0.35, maxZoom: 18, attribution: 'ESRI'
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update center on city change ──
  useEffect(() => {
    if (mapRef.current) mapRef.current.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom]);

  // ── Rebuild metro lines on city change ──
  useEffect(() => {
    if (!mapRef.current || !metroLayerRef.current) return;
    // Clear existing metro layers
    metroLayerRef.current.clearLayers();

    // Redraw metro lines for the current city
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

  // ── Draft Pin Draggable Marker ──
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

  // ── Toggle layers ──
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

  // ── Filter pins ──
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

  // ══════════════════════════════════════
  // RENDER MARKERS
  // ══════════════════════════════════════
  useEffect(() => {
    if (!clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();

    filteredPins.forEach((pin) => {
      const icon = createPinIcon(pin.gated, pin.available, pin.flatmate_wanted, pin.category);
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
              <div style="font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:28px;color:var(--text);line-height:1;">${fmtRent(pin.rent)}</div>
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
      marker.bindTooltip(
        `<div style="font-family:var(--font-outfit),sans-serif;font-weight:800;font-size:12px;color:#0f0f0f;">${pin.bhk}BHK - ${fmtRent(pin.rent)}</div>`, 
        { direction: 'top', offset: [0, -36], className: 'bg-white rounded-md px-2 py-1 shadow-xl border-0', opacity: 0.95 }
      );
      clusterGroupRef.current!.addLayer(marker);
    });
  }, [filteredPins, userIpHash]);

  // ══════════════════════════════════════
  // GLOBAL WINDOW HANDLERS (popup buttons)
  // ══════════════════════════════════════
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;

    w.__ratePin__ = (pinId: string) => {
      setRatingModal({ pinId, locality: 0, quality: 0 });
    };

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
        
        if (res.status === 429) {
          showToast(data.error || 'Rate limit reached.');
          return;
        }
        
        if (!res.ok) {
          showToast(data.error || 'Could not find contact.');
          return;
        }
        
        // Open WhatsApp with pre-filled message
        const bhkStr = data.category === 'commercial' ? data.sub_type : `${data.bhk}BHK`;
        const text = `Hi! I saw your ${bhkStr} at ${data.society} for ₹${data.rent.toLocaleString('en-IN')}/mo on the map. Is it still available?`;
        window.open(`https://wa.me/91${data.phone}?text=${encodeURIComponent(text)}`, '_blank');
        
        showToast(`Success! ${data.revealsRemaining} reveals left today.`);
      } catch {
        showToast('Error connecting to WhatsApp.');
      }
    };

    w.__sharePin__ = (_id: string, bhk: string, rent: string, society: string) => {
      const text = `Check this ${bhk}BHK at ${decodeURIComponent(society)} for ₹${parseInt(rent).toLocaleString('en-IN')}/mo on ${city}.rent`;
      if (navigator.share) {
        navigator.share({ title: `${city}.rent`, text, url: window.location.href });
      } else {
        navigator.clipboard.writeText(text + ' — ' + window.location.href);
        showToast('Link copied to clipboard!');
      }
    };

    w.__deletePin__ = async (id: string) => {
      if (!confirm('Delete this pin? This cannot be undone.')) return;
      try {
        await fetch('/api/pins/' + id, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip_hash: userIpHash }) });
        showToast('Pin deleted.');
        fetchPins();
      } catch { showToast('Failed to delete.'); }
    };
  }, [fetchPins, showToast, city, userIpHash]);

  // ── Area Stats ──
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

            // Compute area stats
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

            setAreaStats({
              total: inArea.length,
              byBhk: bhkStats,
              gatedPercent: inArea.length > 0 ? Math.round((gatedCount / inArea.length) * 100) : 0,
            });
            setAreaSelectMode(false);
            map.getContainer().style.cursor = '';
            return [];
          }
          return next;
        });
      };
      map.on('click', handler);
      return () => { map.off('click', handler); };
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [areaSelectMode, pins]);

  // ── Submit rating ──
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

  // ── Pin submit ──
  const handlePinSubmit = async (data: Record<string, unknown>) => {
    if (!draftPinLatLng) return;
    const body = { city, lat: draftPinLatLng.lat, lng: draftPinLatLng.lng, ip_hash: userIpHash, ...data };
    try {
      await fetch('/api/pins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      showToast('Pin dropped! 📍');
      fetchPins();
    } catch { showToast('Failed to add pin.'); }
    setShowPinModal(false);
    setDraftPinLatLng(null);
  };

  const handleLocate = () => {
    if (!mapRef.current) return;
    if ('geolocation' in navigator) {
      showToast('Locating you...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current!.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
          showToast('Found you!');
        },
        () => {
          mapRef.current!.flyTo([centerLat, centerLng], zoom);
          showToast("Couldn't grab location, moving to center.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      mapRef.current.flyTo([centerLat, centerLng], zoom);
    }
  };

  // ══════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════
  return (
    <div className="relative w-full h-screen bg-bg overflow-hidden">
      {/* Map canvas — base layer */}
      <div ref={mapContainerRef} className="absolute inset-0 z-[100]" />

      {/* City Builds Itself Loader */}
      <MapLoader isReady={mapReady} />

      {/* Top Center UI Toggle for Category Mode */}
      <div className="absolute top-[84px] left-1/2 -translate-x-1/2 z-[2000] glass px-1.5 py-1.5 rounded-2xl flex gap-1 shadow-2xl pointer-events-auto border border-border1">
        <button
          onClick={() => setCategoryMode('residential')}
          className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${
            categoryMode === 'residential' ? 'bg-accent text-bg shadow-md' : 'text-text3 hover:text-text2'
          }`}
        >
          Residential
        </button>
        <button
          onClick={() => setCategoryMode('commercial')}
          className={`px-4 py-2 rounded-xl text-xs font-syn font-bold uppercase tracking-widest transition-all ${
            categoryMode === 'commercial' ? 'bg-purple text-bg shadow-md' : 'text-text3 hover:text-text2'
          }`}
        >
          Commercial
        </button>
      </div>

      {/* Topbar overlay */}
      <Topbar 
        city={city} 
        onToggleFilter={() => setShowFilterSidebar(!showFilterSidebar)} 
        showFilters={showFilterSidebar} 
        onSelectLocation={(lat, lng) => {
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 16);
          }
        }}
      />

      {/* Left Filter Panel */}
      <div
        className={`fixed top-[84px] left-4 bottom-24 lg:bottom-4 w-[260px] z-[1500] glass rounded-2xl overflow-y-auto transition-transform duration-300 ${
          showFilterSidebar ? 'translate-x-0' : '-translate-x-[300px]'
        }`}
      >
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          city={city}
          categoryMode={categoryMode}
        />
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilterSidebar(!showFilterSidebar)}
        className="fixed bottom-28 left-4 lg:hidden z-[1500] glass glass-hover px-4 py-2.5 rounded-xl text-text2 font-syn font-bold text-xs shadow-xl"
      >
        {showFilterSidebar ? '✕ Hide' : '☰ Filters'}
      </button>

      {/* Right Controls */}
      <RightControls
        onLocate={handleLocate}
        onHunt={() => setShowFlatHunt(true)}
        onStats={() => setShowStatsPanel(!showStatsPanel)}
        onAreaStats={() => { setAreaSelectMode(true); setAreaCorners([]); setAreaStats(null); showToast('Click 2 corners on the map to draw an area.'); }}
        onToggleMetro={() => setShowMetro(!showMetro)}
        showMetro={showMetro}
        onToggleGreen={() => setShowGreen(!showGreen)}
        showGreen={showGreen}
      />

      {/* Sliding panels */}
      {showStatsPanel && <StatsPanel stats={stats} city={city} onClose={() => setShowStatsPanel(false)} />}
      
      {/* Draft Pin UI Overlay */}
      {draftPinLatLng && !showPinModal && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] glass px-4 py-4 rounded-2xl flex flex-col items-center gap-3 w-max max-w-[90vw] shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-[popup-enter_0.2s_ease]">
          <div className="text-text1 font-syn font-bold text-xs tracking-widest uppercase flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
             Drag pin to adjust location
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                if ('geolocation' in navigator) {
                  showToast('Getting precise location...');
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setDraftPinLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
                      showToast('Pin moved to your location!');
                    },
                    () => showToast("Couldn't grab location. Allow GPS access."),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                  );
                } else {
                  showToast("Geolocation not supported.");
                }
              }}
              className="flex-[1.5] py-2 px-3 bg-surface2 text-text1 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface3 transition-colors flex items-center justify-center gap-1.5 border border-border1"
            >
              📍 My Location
            </button>
            <button
              onClick={() => setDraftPinLatLng(null)}
              className="px-4 py-2 bg-surface2 text-text3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-text1 transition-colors border border-border1"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPinModal(true)}
              className="flex-[1.5] py-2 px-3 bg-accent text-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Confirm ➔
            </button>
          </div>
        </div>
      )}

      {showPinModal && draftPinLatLng && <PinModal lat={draftPinLatLng.lat} lng={draftPinLatLng.lng} onClose={() => setShowPinModal(false)} onSubmit={handlePinSubmit} />}
      {showFlatHunt && <FlatHuntContent city={city} onClose={() => setShowFlatHunt(false)} onSubmitSeeker={() => { setShowFlatHunt(false); showToast('Seeker profile saved! We\'ll match you.'); }} />}

      {/* ── Bottom Bar ── */}
      <div className="absolute bottom-5 inset-x-5 z-[1000] pointer-events-none flex items-end justify-between gap-4">
        {/* Left pill: live count */}
        <div className="glass rounded-xl px-4 py-3 pointer-events-auto shadow-2xl flex items-center gap-3 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(62,200,122,0.6)]" />
          <span className="font-syn font-bold text-xs text-text1">{filteredPins.length} LIVE PINS</span>
        </div>

        {/* Center hint */}
        <div className="text-text3 font-syn font-bold uppercase tracking-widest text-[10px] hidden md:block opacity-70 text-center flex-1">
          Tap map to drop a pin · Anonymous · No login needed
        </div>

        {/* Right CTA */}
        <button
          className="bg-accent text-bg px-5 py-3 rounded-xl pointer-events-auto font-syn font-extrabold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(232,197,71,0.25)] hover:scale-105 active:scale-95 transition-transform shrink-0"
          onClick={() => setShowLocationSearch(true)}
        >
          📍 Pin Rent Here
        </button>
      </div>

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] glass rounded-xl px-6 py-3 text-text1 font-syn font-bold text-sm shadow-2xl animate-[popup-enter_0.2s_ease]">
          {toastMessage}
        </div>
      )}

      {/* ── Rating Modal ── */}
      {ratingModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRatingModal(null)}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Rate this listing</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">📍 Locality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRatingModal({ ...ratingModal, locality: n })}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border ${ratingModal.locality >= n ? 'bg-accent text-bg border-accent' : 'border-border2 text-text3'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-syn font-bold uppercase tracking-widest text-text3 block mb-2">🏗 Built Quality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRatingModal({ ...ratingModal, quality: n })}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border ${ratingModal.quality >= n ? 'bg-accent text-bg border-accent' : 'border-border2 text-text3'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={submitRating} className="w-full py-3 bg-accent text-bg font-syn font-extrabold uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(232,197,71,0.3)]">
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* ── Area Stats Modal ── */}
      {areaStats && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setAreaStats(null); if (areaRectRef.current && mapRef.current) mapRef.current.removeLayer(areaRectRef.current); }}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-syn font-bold text-lg text-text1 uppercase tracking-widest">Area Stats</h3>
              <button onClick={() => { setAreaStats(null); if (areaRectRef.current && mapRef.current) mapRef.current.removeLayer(areaRectRef.current); }} className="text-text3 hover:text-text1 text-xl">✕</button>
            </div>

            <div className="flex items-end gap-2 mb-2">
              <span className="font-syn font-extrabold text-3xl text-text1">{areaStats.total}</span>
              <span className="text-text3 text-sm mb-1">pins in area</span>
            </div>

            <div className="text-xs text-text2 mb-3">
              Gated: <span className="text-accent font-bold">{areaStats.gatedPercent}%</span>
            </div>

            <div className="space-y-2">
              {areaStats.byBhk.map((s: { bhk: number; avg: number; count: number }) => (
                <div key={s.bhk} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border1">
                  <span className="font-syn text-sm font-bold text-text2">{s.bhk} BHK <span className="text-text3 font-normal">({s.count})</span></span>
                  <span className="font-syn text-lg font-bold text-accent">{fmtRent(s.avg)}</span>
                </div>
              ))}
            </div>

            {areaStats.total === 0 && (
              <p className="text-text3 text-sm text-center py-4">No pins found in this area. Try drawing a larger region.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Location Search Modal ── */}
      {showLocationSearch && (
        <LocationSearchModal
          city={city}
          onClose={() => setShowLocationSearch(false)}
          onSelect={(lat, lng) => {
            if (mapRef.current) {
              mapRef.current.flyTo([lat, lng], 17);
            }
            setDraftPinLatLng({ lat, lng });
            setShowLocationSearch(false);
          }}
        />
      )}

      {/* ── Onboarding ── */}
      {showOnboarding && <OnboardingModal onClose={() => { setShowOnboarding(false); localStorage.setItem('has_seen_onboarding', 'true'); }} />}
    </div>
  );
}
