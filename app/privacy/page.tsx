import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data on pune.rent and mumbai.rent.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      <header className="bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 px-4 md:px-8 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <span className="text-white font-bold text-sm">pune.rent</span>
          </Link>
          <Link href="/pune" className="text-gray-400 hover:text-white text-xs">← Map</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-400">
          <section>
            <h2 className="text-white font-bold text-xl">What We Collect</h2>
            <ul>
              <li><strong>IP Address (hashed):</strong> We hash your IP address using SHA-256 to prevent duplicate pins and enable pin ownership. We never store your raw IP address.</li>
              <li><strong>Location (approximate):</strong> Pin coordinates are rounded to 3 decimal places (~111m accuracy) in API responses to protect exact location privacy.</li>
              <li><strong>Email & Phone (optional):</strong> If you provide them for flat hunt matching, they are stored encrypted and never displayed publicly on the map. They are only shared privately via email when a match is found.</li>
              <li><strong>Rent data:</strong> The rent amount, BHK, society name, and other details you voluntarily submit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Third-Party Services</h2>
            <ul>
              <li><strong>Supabase:</strong> Database hosting (PostgreSQL). Your data is stored on Supabase infrastructure.</li>
              <li><strong>Vercel:</strong> Application hosting and analytics.</li>
              <li><strong>OpenFreeMap / OpenStreetMap:</strong> Map tiles. No user data is sent to these services.</li>
              <li><strong>Nominatim (OpenStreetMap):</strong> Geocoding for neighborhood search. Search queries are sent but no personal data.</li>
              <li><strong>Resend:</strong> Transactional emails for flat hunt matching only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Data Retention</h2>
            <ul>
              <li><strong>Rent pins:</strong> Kept until you delete them or they receive 3 reports (auto-hidden).</li>
              <li><strong>Seeker profiles:</strong> Automatically expire after 30 days.</li>
              <li><strong>Ratings & comments:</strong> Kept as long as the associated pin exists.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Your Rights</h2>
            <ul>
              <li>Delete your pins at any time from the map (we identify your pins via IP hash).</li>
              <li>Email us to request full data deletion.</li>
              <li>No account needed — we have no login or signup.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">What We Don&apos;t Do</h2>
            <ul>
              <li>❌ No advertising</li>
              <li>❌ No data selling to brokers or third parties</li>
              <li>❌ No user accounts or tracking cookies</li>
              <li>❌ No scraping of real estate platforms</li>
            </ul>
          </section>

          <p className="text-gray-600 text-xs mt-8">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </main>
  );
}
