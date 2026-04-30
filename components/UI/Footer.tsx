import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-4 z-[2000] flex gap-4">
      <Link href="/privacy" className="text-[10px] font-syn font-bold text-text3 hover:text-accent uppercase tracking-widest transition-all">
        Privacy Policy
      </Link>
      <Link href="/terms" className="text-[10px] font-syn font-bold text-text3 hover:text-accent uppercase tracking-widest transition-all">
        Terms of Service
      </Link>
      <span className="text-[10px] font-syn font-bold text-text3/50 uppercase tracking-widest">
        © 2026 Pune Rent Map
      </span>
    </footer>
  );
}
