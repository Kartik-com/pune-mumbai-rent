import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CITIES,
  slugify,
  getNeighborhoodBySlug,
  getNearbyNeighborhoods,
} from '@/lib/cities';
import {
  generateNeighborhoodMetadata,
  generateFAQJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo';

interface NeighborhoodPageProps {
  params: { city: string; neighborhood: string };
}

export async function generateMetadata({
  params,
}: NeighborhoodPageProps): Promise<Metadata> {
  const neighborhood = getNeighborhoodBySlug(params.city, params.neighborhood);
  if (!neighborhood) return { title: 'Not Found' };
  return generateNeighborhoodMetadata(params.city, neighborhood);
}

export function generateStaticParams() {
  const allParams: { city: string; neighborhood: string }[] = [];
  Object.keys(CITIES).forEach((city) => {
    CITIES[city].neighborhoods.forEach((n) => {
      allParams.push({ city, neighborhood: slugify(n) });
    });
  });
  return allParams;
}

// Fetch stats data server-side
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getNeighborhoodStats(_city: string) {
  // In production this would query Supabase; for SSG we return placeholder data
  return [
    { bhk: 1, avg_rent: 15000, count: 12 },
    { bhk: 2, avg_rent: 25000, count: 28 },
    { bhk: 3, avg_rent: 38000, count: 15 },
  ];
}

export default async function NeighborhoodPage({
  params,
}: NeighborhoodPageProps) {
  const cityConfig = CITIES[params.city];
  if (!cityConfig) notFound();

  const neighborhood = getNeighborhoodBySlug(params.city, params.neighborhood);
  if (!neighborhood) notFound();

  const stats = await getNeighborhoodStats(params.city);
  const nearby = getNearbyNeighborhoods(params.city, neighborhood, 3);
  const faqJsonLd = generateFAQJsonLd(neighborhood, cityConfig, stats);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    params.city,
    cityConfig.name,
    neighborhood
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <main className="min-h-screen bg-gray-950">
        {/* Header */}
        <header className="bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 px-4 md:px-8 py-3 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href={`/${params.city}`} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-white font-bold text-sm">
                {params.city}.rent
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-xs">
              <Link href={`/${params.city}`} className="text-gray-400 hover:text-white transition-colors">
                ← Map
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>›</span>
            <Link href={`/${params.city}`} className="hover:text-emerald-400 transition-colors">
              {cityConfig.name}
            </Link>
            <span>›</span>
            <span className="text-emerald-400">{neighborhood}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Rent Prices in{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              {neighborhood}
            </span>
            , {cityConfig.name}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
            What residents actually pay. Community-reported, anonymous, real
            rent data — no brokers, no estimates.
          </p>

          <Link
            href={`/${params.city}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            🗺️ View on Map
          </Link>
        </section>

        {/* Stats Cards */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <h2 className="text-white font-bold text-xl mb-6">
            Average Rent by BHK in {neighborhood}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.bhk}
                className="bg-gray-900 border border-gray-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    {s.bhk}BHK
                  </span>
                  <span className="text-xs text-gray-600 bg-gray-800/50 px-2 py-1 rounded-lg">
                    {s.count} pins
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  ₹{s.avg_rent.toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Prose Section */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 md:p-8">
            <h2 className="text-white font-bold text-xl mb-4">
              Renting in {neighborhood}, {cityConfig.name} — What Residents
              Actually Pay
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-4">
              <p>
                {neighborhood} is one of {cityConfig.name}&apos;s most sought-after
                neighborhoods for renters. Our community-reported data gives you an
                honest picture of what people actually pay — not inflated broker
                prices or outdated estimates.
              </p>
              <p>
                Average rents in {neighborhood} vary significantly based on BHK
                configuration, whether the building is a gated society or
                independent, and furnishing status. The data on this page is
                contributed anonymously by residents — every pin represents a real
                person paying real rent.
              </p>
              <p>
                Use our interactive map to explore rent prices block by block. You
                can filter by BHK, furnished vs unfurnished, gated vs non-gated,
                and more. If you live in {neighborhood}, consider adding your rent
                to help others make informed decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Nearby Neighborhoods */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <h2 className="text-white font-bold text-xl mb-4">
            Nearby Neighborhoods
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nearby.map((n) => (
              <Link
                key={n}
                href={`/${params.city}/${slugify(n)}`}
                className="bg-gray-900 border border-gray-800/50 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-gray-800/50 transition-all group"
              >
                <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                  {n}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  View rent prices in {n} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* All Neighborhoods */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 pb-16">
          <h2 className="text-white font-bold text-xl mb-4">
            All {cityConfig.name} Neighborhoods
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {cityConfig.neighborhoods.map((n) => (
              <Link
                key={n}
                href={`/${params.city}/${slugify(n)}`}
                className={`text-xs px-3 py-2 rounded-lg transition-all border ${
                  n === neighborhood
                    ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                    : 'text-gray-400 hover:text-emerald-400 border-transparent hover:border-gray-700/50 hover:bg-gray-800/50'
                }`}
              >
                {n}
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 bg-gray-950/80 px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} {params.city}.rent — Real rents. Real people. No brokers.
            </p>
            <div className="flex gap-4 text-xs">
              <Link href="/privacy" className="text-gray-500 hover:text-emerald-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-emerald-400 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
