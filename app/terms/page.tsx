import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for pune.rent and mumbai.rent.',
};

export default function TermsPage() {
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
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-400">
          <section>
            <h2 className="text-white font-bold text-xl">Using This Service</h2>
            <p>
              By using pune.rent or mumbai.rent, you agree to these terms. This is a free,
              community-driven platform for sharing real rent data anonymously. No account is required.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Content Guidelines</h2>
            <ul>
              <li>Only post real rent data that you personally pay or have verified.</li>
              <li>Do not post false, misleading, or malicious information.</li>
              <li>Do not use the platform to spam, harass, or scam other users.</li>
              <li>Pins with 3 or more community reports are automatically hidden.</li>
              <li>We reserve the right to remove any content at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Accuracy Disclaimer</h2>
            <p>
              All rent data is self-reported by anonymous community members. We do not
              verify, audit, or guarantee the accuracy of any rent amount posted on the map.
              Use this data as one of many data points in your rent research — not as the sole
              basis for financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Flat Hunt Matching</h2>
            <p>
              The flat hunt feature connects seekers with available listings via email.
              We are not a broker and do not charge any fees. We are not responsible for
              any interactions, agreements, or disputes between matched parties. Use
              caution and good judgment when communicating with strangers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Rate Limiting & Fair Use</h2>
            <ul>
              <li>Maximum 3 pins per IP address per 24 hours.</li>
              <li>One rating per IP per pin.</li>
              <li>Seeker profiles expire after 30 days.</li>
              <li>Abuse of the platform may result in IP-level restrictions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl">Liability</h2>
            <p>
              This service is provided &quot;as is&quot; without warranties of any kind.
              We are not liable for any losses or damages arising from your use of
              this platform or reliance on the data provided.
            </p>
          </section>

          <p className="text-gray-600 text-xs mt-8">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </main>
  );
}
