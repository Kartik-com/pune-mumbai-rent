import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CITIES } from '@/lib/cities';
import { generateCityMetadata } from '@/lib/seo';
import MapContainer from '@/components/Map/MapContainer';

interface CityPageProps {
  params: { city: string };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = CITIES[params.city];
  if (!city) return { title: 'Not Found' };
  return generateCityMetadata(params.city);
}

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export default function CityPage({ params }: CityPageProps) {
  const cityConfig = CITIES[params.city];
  if (!cityConfig) notFound();

  return (
    <main className="h-screen flex flex-col">


      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          city={params.city}
          centerLat={cityConfig.lat}
          centerLng={cityConfig.lng}
          zoom={cityConfig.zoom}
        />
      </div>

    </main>
  );
}
