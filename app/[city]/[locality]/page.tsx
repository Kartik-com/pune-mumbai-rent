import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CITIES, slugify, getNeighborhoodBySlug } from '@/lib/cities';
import { generateNeighborhoodMetadata, generateFAQJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import MapContainer from '@/components/Map/MapContainer';
import { AREA_LABELS } from '@/lib/areaLabels';

interface LocalityPageProps {
  params: { city: string; locality: string };
}

export async function generateMetadata({ params }: LocalityPageProps): Promise<Metadata> {
  const neighborhood = getNeighborhoodBySlug(params.city, params.locality);
  if (!neighborhood) return { title: 'Not Found' };
  return generateNeighborhoodMetadata(params.city, neighborhood);
}

export function generateStaticParams() {
  const params: { city: string; locality: string }[] = [];
  Object.keys(CITIES).forEach((city) => {
    CITIES[city].neighborhoods.forEach((locality) => {
      params.push({ city, locality: slugify(locality) });
    });
  });
  return params;
}

export default function LocalityPage({ params }: LocalityPageProps) {
  const cityConfig = CITIES[params.city];
  if (!cityConfig) notFound();

  const neighborhood = getNeighborhoodBySlug(params.city, params.locality);
  if (!neighborhood) notFound();

  // Find coordinates in AREA_LABELS
  const label = AREA_LABELS.find(l => l.city === params.city && slugify(l.name) === params.locality);
  
  const lng = label ? label.coords[1] : cityConfig.lng;
  const zoom = label ? 15 : cityConfig.zoom;

  // JSON-LD Schema Data
  const breadcrumbSchema = generateBreadcrumbJsonLd(params.city, cityConfig.name, neighborhood);
  
  // Create a minimal FAQ schema based on city averages as fallback
  const faqSchema = generateFAQJsonLd(neighborhood, cityConfig, [
    { bhk: 1, avg_rent: 15000, count: 12 },
    { bhk: 2, avg_rent: 25000, count: 8 },
    { bhk: 3, avg_rent: 40000, count: 5 }
  ]);

  return (
    <main className="h-screen flex flex-col">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex-1 relative">
        <MapContainer
          city={params.city}
          centerLat={lat}
          centerLng={lng}
          zoom={zoom}
        />
        
        {/* Locality Overlay for SEO Context */}
        <div className="absolute top-[84px] left-1/2 -translate-x-1/2 z-[2000] pointer-events-none">
            <div className="glass px-6 py-3 rounded-2xl border border-accent/20 shadow-2xl flex flex-col items-center">
                <span className="text-[10px] font-syn font-bold text-accent uppercase tracking-[0.3em] mb-1">Exploring Neighborhood</span>
                <h1 className="text-xl font-syn font-black text-text1 uppercase tracking-tighter">{neighborhood}</h1>
            </div>
        </div>
      </div>
    </main>
  );
}
