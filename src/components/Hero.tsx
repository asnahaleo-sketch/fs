import { motion } from 'framer-motion';
import { FileText, CheckCircle2 } from 'lucide-react';
import content from '../content.json';
import HeroParticles from './HeroParticles';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero({ isTransitioning, onStart, cmsData }: { isTransitioning: boolean; onStart: () => void; cmsData?: any }) {
  // Merge DB hero data on top of defaults so missing keys always fall back gracefully
  const hero = { ...content.hero, ...(cmsData?.hero || {}) };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">

      {/* ─── Z-0: Anti-Gravity Starfield (isolated inside section) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <HeroParticles />

        {/* Top edge fade: blends into the app's pure-black header area */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />

        {/* Bottom edge fade: smooth dissolve into the dashboard below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        {/* Radial focus vignette — keeps center readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 10%, rgba(0,0,0,0.60) 100%)',
          }}
        />
      </div>

      {/* ─── Z-10: Hero Content ─── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl"
        animate={isTransitioning ? { scale: 3, opacity: 0, filter: 'blur(20px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8 w-full"
        >
          {/* Badges */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md glow-indigo text-sm font-medium">
              <FileText className="w-4 h-4 text-electric" />
              <span>{hero.badges.file}</span>
            </div>
            <div id="promo-banner" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{hero.badges.featured}</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            id="hero-title"
            variants={fadeUp}
            className="font-sans text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[1.08]"
            style={{ textShadow: '0 0 60px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.7)' }}
          >
            {hero.headlinePrefix}
            <br className="hidden md:block" />
            <span className="lavender-gradient block mt-1">{hero.headlineGradient}</span>
          </motion.h1>

          {/* Description */}
          {hero.description && (
            <motion.p 
              variants={fadeUp} 
              className="text-lg md:text-xl text-white/70 max-w-2xl font-medium mt-2 leading-relaxed"
            >
              {hero.description}
            </motion.p>
          )}

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button
              onClick={onStart}
              id="start-optimizing"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(120, 160, 255, 0.4)' }}
              className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium transition-all hover:bg-white/10 glow-indigo"
            >
              {hero.buttons.primary}
            </motion.button>
            <button className="px-8 py-3.5 rounded-full border border-white/20 text-white/80 font-medium hover:bg-white/5 hover:border-white/40 transition-all backdrop-blur-sm">
              {hero.buttons.secondary}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
