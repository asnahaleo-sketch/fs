import { useEffect, useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import content from '../content.json';

// ─── Dot Particle Canvas ────────────────────────────────────────────────────
interface Dot {
  originX: number; originY: number; size: number; depth: number;
  color: string; alpha: number; twinkleSpeed: number; twinkleOffset: number;
}

const DOT_COUNT = 1800;
const PARALLAX_STRENGTH = 50;
const blueShades = [
  'rgba(135,206,250,ALPHA)', 'rgba( 70,130,180,ALPHA)',
  'rgba( 30, 80,200,ALPHA)', 'rgba(  0,100,255,ALPHA)', 'rgba( 50,150,255,ALPHA)',
];

function DashboardDotCanvas({ scrollProgress }: { scrollProgress: { get: () => number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let rafId: number, dots: Dot[] = [], mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; buildDots(); };
    const buildDots = () => {
      dots = Array.from({ length: DOT_COUNT }, (_, i) => {
        const depth = Math.random() * 4 + 1, alpha = 0.25 + (depth / 5) * 0.75, isWhite = i % 3 === 0;
        const color = isWhite ? `rgba(255,255,255,${alpha.toFixed(2)})` : blueShades[Math.floor(Math.random() * blueShades.length)].replace('ALPHA', alpha.toFixed(2));
        return { originX: Math.random() * canvas.width, originY: Math.random() * canvas.height, size: (depth / 5) * 2 + 0.4, depth, color, alpha, twinkleSpeed: 0.003 + Math.random() * 0.01, twinkleOffset: Math.random() * Math.PI * 2 };
      });
    };
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX - window.innerWidth / 2; mouseY = e.clientY - window.innerHeight / 2; };
    window.addEventListener('mousemove', onMouseMove); window.addEventListener('resize', resize); resize();
    const draw = () => {
      t++; smoothX += (mouseX - smoothX) * 0.04; smoothY += (mouseY - smoothY) * 0.04;
      const scrollDrift = scrollProgress.get() * 120;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const dot of dots) {
        const pf = dot.depth / 5, ox = (smoothX / (canvas.width / 2)) * PARALLAX_STRENGTH * pf, oy = (smoothY / (canvas.height / 2)) * PARALLAX_STRENGTH * pf - scrollDrift * pf;
        const twinkle = Math.sin(t * dot.twinkleSpeed + dot.twinkleOffset) * 0.3 + 0.7;
        ctx.globalAlpha = Math.min(dot.alpha * twinkle, 1);
        if (dot.depth > 3.5) { ctx.shadowBlur = 5; ctx.shadowColor = dot.color; } else { ctx.shadowBlur = 0; }
        ctx.beginPath(); ctx.arc(dot.originX + ox, dot.originY + oy, dot.size, 0, Math.PI * 2); ctx.fillStyle = dot.color; ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('resize', resize); cancelAnimationFrame(rafId); };
  }, [scrollProgress]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />;
}

// ─── AI Tool Data — final positions are px offsets from screen center ─────────
// All logos start clustered at (0,0) = screen center, then explode outward on scroll
const AI_TOOLS = [
  {
    name: 'ChatGPT',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>),
    color: 'from-emerald-500/20 to-teal-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.15)',
    finalX: -500, finalY: -210, floatY: [-8, 8] as [number, number], floatDuration: 3.2, delay: 0,
  },
  {
    name: 'Claude',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M4.709 15.955l4.72-2.647.081-.112-.081-.112-4.72-2.647-.081.112.081.112 4.72 2.647zm6.18-4.65l.08.112 4.72-2.647-.08-.112-4.72 2.647zm4.72 2.003l-4.72-2.647-.08.112.08.112 4.72 2.647.08-.112-.08-.112zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>),
    color: 'from-orange-500/20 to-amber-600/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'rgba(249,115,22,0.15)',
    finalX: 500, finalY: -210, floatY: [6, -10] as [number, number], floatDuration: 4.1, delay: 0.08,
  },
  {
    name: 'Gemini',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2a1 1 0 0 1 .894.553l2.618 5.236 5.236 2.618a1 1 0 0 1 0 1.789l-5.236 2.618-2.618 5.236a1 1 0 0 1-1.788 0l-2.618-5.236-5.236-2.618a1 1 0 0 1 0-1.789l5.236-2.618 2.618-5.236A1 1 0 0 1 12 2z"/></svg>),
    color: 'from-blue-500/20 to-indigo-600/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'rgba(59,130,246,0.15)',
    finalX: -500, finalY: 210, floatY: [-10, 6] as [number, number], floatDuration: 3.7, delay: 0.06,
  },
  {
    name: 'Perplexity',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>),
    color: 'from-teal-500/20 to-cyan-600/10', border: 'border-teal-500/30', text: 'text-teal-400', glow: 'rgba(20,184,166,0.15)',
    finalX: 500, finalY: 210, floatY: [10, -6] as [number, number], floatDuration: 4.5, delay: 0.1,
  },
  {
    name: 'Grok',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
    color: 'from-slate-400/20 to-zinc-600/10', border: 'border-slate-400/25', text: 'text-slate-300', glow: 'rgba(148,163,184,0.12)',
    finalX: -660, finalY: 0, floatY: [-6, 8] as [number, number], floatDuration: 3.9, delay: 0.04,
  },
  {
    name: 'Copilot',
    icon: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>),
    color: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'rgba(168,85,247,0.15)',
    finalX: 660, finalY: 0, floatY: [8, -8] as [number, number], floatDuration: 4.2, delay: 0.12,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { scrollContainerRef: RefObject<HTMLElement | null>; cmsData?: any; }

export default function DashboardHero({ scrollContainerRef, cmsData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: scrollContainerRef, target: containerRef, offset: ['start start', 'end end'] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 60, mass: 0.2 });

  // ── Logo scroll transforms ──
  // All logos start at center (0,0), explode to finalX/finalY between 0→10%,
  // hold position (10%→88%), then drift further + fade out (88%→100%)
  const useMkX = (fx: number) => useTransform(sp, [0, 0.10, 0.88, 1.0], [0, fx, fx, fx * 1.35]);
  const useMkY = (fy: number) => useTransform(sp, [0, 0.10, 0.88, 1.0], [0, fy, fy, fy * 1.35]);

  const l0x = useMkX(AI_TOOLS[0].finalX); const l0y = useMkY(AI_TOOLS[0].finalY);
  const l1x = useMkX(AI_TOOLS[1].finalX); const l1y = useMkY(AI_TOOLS[1].finalY);
  const l2x = useMkX(AI_TOOLS[2].finalX); const l2y = useMkY(AI_TOOLS[2].finalY);
  const l3x = useMkX(AI_TOOLS[3].finalX); const l3y = useMkY(AI_TOOLS[3].finalY);
  const l4x = useMkX(AI_TOOLS[4].finalX); const l4y = useMkY(AI_TOOLS[4].finalY);
  const l5x = useMkX(AI_TOOLS[5].finalX); const l5y = useMkY(AI_TOOLS[5].finalY);
  const logoTransforms = [[l0x, l0y], [l1x, l1y], [l2x, l2y], [l3x, l3y], [l4x, l4y], [l5x, l5y]];

  // Full opacity at entry → dim to 70% during text (clearly visible) → out at exit
  const logoGroupOpacity = useTransform(sp, [0, 0.08, 0.16, 0.85, 1.0], [1, 1, 0.70, 0.70, 0]);

  const data = cmsData || content;
  // Safe fallback: use DB features only if they have >= 3 items, else use static content
  const dbFeatures = Array.isArray(data.features) && data.features.length >= 3 ? data.features : null;
  const staticFeatures = content.dashboardHero?.features || [];
  const features = dbFeatures || staticFeatures;

  const opacity1 = useTransform(sp, [0.05, 0.15, 0.25], [0, 1, 0]);
  const y1       = useTransform(sp, [0.05, 0.25], [40, -40]);
  const opacity2 = useTransform(sp, [0.35, 0.45, 0.58], [0, 1, 0]);
  const y2       = useTransform(sp, [0.35, 0.58], [40, -40]);
  const opacity3 = useTransform(sp, [0.65, 0.75, 0.88], [0, 1, 0]);
  const y3       = useTransform(sp, [0.65, 0.88], [40, -40]);
  const exitOpacity = useTransform(sp, [0.88, 1], [1, 0]);
  const exitBlurVal = useTransform(sp, [0.88, 1], [0, 12]);
  const exitFilter  = useMotionTemplate`blur(${exitBlurVal}px)`;
  const exitScale   = useTransform(sp, [0.88, 1], [1, 0.92]);

  return (
    <div ref={containerRef} className="relative w-full h-[400vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">

        <DashboardDotCanvas scrollProgress={sp} />

        {/* Vignette */}
        <div className="absolute inset-0 z-[2] pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.65) 100%)' }} />

        {/* ─── AI Logos — clustered at center on entry, burst to edges on scroll ─── */}
        <motion.div
          style={{ opacity: logoGroupOpacity }}
          className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center"
        >
          {AI_TOOLS.map((tool, i) => {
            const [tx, ty] = logoTransforms[i];
            return (
              <motion.div
                key={tool.name}
                className="absolute"
                style={{ x: tx, y: ty }}
                // Start clustered at center with stagger, THEN motion.style moves them outward
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, filter: 'brightness(1.2)', cursor: 'pointer' }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.6, delay: tool.delay, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {/* Continuous float loop independent of scroll */}
                <motion.div
                  animate={{ y: tool.floatY }}
                  transition={{ repeat: Infinity, repeatType: 'mirror', duration: tool.floatDuration, ease: 'easeInOut' }}
                >
                  <div
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-br ${tool.color} border ${tool.border} backdrop-blur-md`}
                    style={{ boxShadow: `0 0 24px ${tool.glow}, inset 0 1px 0 rgba(255,255,255,0.10)` }}
                  >
                    <span className={tool.text}>{tool.icon}</span>
                    <span className={`text-sm font-semibold tracking-wide ${tool.text}`}>{tool.name}</span>
                  </div>
                  {/* Pulsing status dot */}
                  <motion.div
                    className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${tool.text.replace('text-', 'bg-')}`}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2, delay: tool.delay + 0.5 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}

          {/* Subtle label — fades in after logos settle */}
          <motion.div
            className="absolute top-[10%]"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
          >
            <p className="text-white/30 text-xs font-medium tracking-[0.25em] uppercase">
              Discovered by AI engines worldwide
            </p>
          </motion.div>
        </motion.div>

        {/* ─── Scrolling Feature Text Overlays ─── */}
        <motion.div style={{ opacity: exitOpacity, filter: exitFilter, scale: exitScale }} className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-5xl mx-auto px-6 text-center h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,0,0,0.7)_0%,transparent_100%)] z-0" />

            <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white" style={{ textShadow: '0 0 60px rgba(0,0,0,0.9)' }}>{features[0].headline || features[0].title}</h2>
              <p className="text-xl md:text-2xl text-blue-100/90 max-w-2xl mx-auto font-medium leading-relaxed">{features[0].subtext || features[0].description}</p>
            </motion.div>

            <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white" style={{ textShadow: '0 0 60px rgba(0,0,0,0.9)' }}>{features[1].headline || features[1].title}</h2>
              <p className="text-xl md:text-2xl text-blue-100/90 max-w-2xl mx-auto font-medium leading-relaxed">{features[1].subtext || features[1].description}</p>
            </motion.div>

            <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-white" style={{ textShadow: '0 0 60px rgba(0,0,0,0.9)' }}>{features[2].headline || features[2].title}</h2>
              <p className="text-xl md:text-2xl text-blue-100/90 max-w-2xl mx-auto font-medium leading-relaxed">{features[2].subtext || features[2].description}</p>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
