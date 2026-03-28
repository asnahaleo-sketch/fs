import content from '../content.json';

export default function Footer() {
  const { footer } = content;

  return (
    <footer className="w-full relative z-20 py-12 px-6 border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <h4 className="font-bold text-xl tracking-tighter text-white">
          {footer.brand}
        </h4>
        
        <nav className="flex items-center gap-6">
          {footer.links.map((link, idx) => (
            <a key={idx} href="#" className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </nav>
        
        <p className="text-xs text-white/30">
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
