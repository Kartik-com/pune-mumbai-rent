import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text1 font-dm p-8 md:p-24 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-12 text-accent font-syn font-bold uppercase tracking-widest text-xs hover:translate-x-[-4px] transition-transform">
        ← Back to Map
      </Link>
      
      <h1 className="text-4xl font-syn font-black uppercase tracking-tighter mb-8 text-text1">
        Terms of <span className="text-accent">Service</span>
      </h1>
      
      <div className="space-y-8 text-text2 leading-relaxed">
        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">1. Community Data</h2>
          <p>
            All data on this map is provided by the community on an &quot;as-is&quot; basis. We do not verify every pin manually. Users are responsible for the accuracy of the data they report.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">2. No Broker Policy</h2>
          <p>
            This platform is intended for direct owner-to-tenant or flatmate-to-flatmate interaction. Professional brokers are prohibited from posting listings here. We reserve the right to remove any pins that appear to be commercial advertisements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">3. Fair Use</h2>
          <p>
            You agree not to use automated tools to scrape data from this map. Attempting to bypass our reveal limits or reporting system will result in your IP hash being blacklisted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-syn font-bold text-text1 uppercase tracking-widest mb-4">4. Disclaimer of Liability</h2>
          <p>
            We are not a real estate agency and do not facilitate rental agreements. We are not liable for any disputes, financial losses, or damages arising from the use of this map or interaction with people found through it.
          </p>
        </section>

        <section className="pt-8 border-t border-border1">
          <p className="text-xs text-text3 italic">
            Last updated: April 30, 2024. By using this site, you agree to these terms.
          </p>
        </section>
      </div>
    </div>
  );
}
