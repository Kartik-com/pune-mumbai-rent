import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text1 font-dm p-8 md:p-24 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-12 text-accent font-syn font-bold uppercase tracking-widest text-xs hover:translate-x-[-4px] transition-transform">
        ← Back to Map
      </Link>
      
      <h1 className="text-4xl font-syn font-black uppercase tracking-tighter mb-8 text-text1">
        Privacy <span className="text-accent">Policy</span>
      </h1>
      
      <div className="space-y-8 text-text2 leading-relaxed">
        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">1. Data Collection</h2>
          <p>
            To keep this map anonymous and community-driven, we do not require accounts. We use a one-way cryptographic hash of your IP address to prevent spam and allow you to manage your own pins. We never store your actual IP address in a readable format.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">2. Cookies</h2>
          <p>
            We use local storage and cookies to remember your map preferences (dark/light mode) and whether you have seen our onboarding guide. No tracking or marketing cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">3. Contact Requests</h2>
          <p>
            When you request to reveal an owner's contact, we log your hashed IP to enforce our daily limits (5 reveals per day). This ensures the data remains available for genuine seekers and isn't scraped by bots.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">4. Third Parties</h2>
          <p>
            We use MapLibre and Carto for map tiles. Your browser communicates directly with these services to load the map. We use Supabase for our database.
          </p>
        </section>

        <section className="pt-8 border-t border-border1">
          <p className="text-xs text-text3 italic">
            Last updated: April 30, 2024. For questions, contact us via the community channels.
          </p>
        </section>
      </div>
    </div>
  );
}
