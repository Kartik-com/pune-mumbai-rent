'use client';

import dynamic from 'next/dynamic';

import MapLoader from '../UI/MapLoader';

const MapLibreMap = dynamic(() => import('./MapLibreMap'), {
  ssr: false,
  loading: () => <MapLoader isReady={false} />,
});

interface MapContainerProps {
  city: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
}

export default function MapContainer({
  city,
  centerLat,
  centerLng,
  zoom,
}: MapContainerProps) {
  return (
    <div className="h-full w-full">
      <MapLibreMap
        city={city}
        centerLat={centerLat}
        centerLng={centerLng}
        zoom={zoom}
      />
    </div>
  );
}
