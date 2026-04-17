'use client';

import dynamic from 'next/dynamic';

import MapLoader from '../UI/MapLoader';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
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
      <LeafletMap
        city={city}
        centerLat={centerLat}
        centerLng={centerLng}
        zoom={zoom}
      />
    </div>
  );
}
