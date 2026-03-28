import { motion, type Variants } from 'framer-motion';
import { BarChart3, Target, CheckCircle2, User, Coins } from 'lucide-react';
import { type RefObject } from 'react';
import DashboardHero from './DashboardHero';
import PricingTable from './PricingTable';
import Testimonials from './Testimonials';
import content from '../content.json';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24, duration: 0.5 } }
};

interface Props {
  scrollContainerRef: RefObject<HTMLElement | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cmsData?: any;
}

export default function Dashboard({ scrollContainerRef, cmsData }: Props) {
  const data = cmsData || content;
  const dashboard = data.dashboard || content.dashboard;
  const crawlerEra = data.crawlerEra || content.crawlerEra;
  const audience = data.audience || content.audience;
  const cta = data.cta || content.cta;
  const metrics = dashboard.analytics;

  return (
    <div id="dashboard" className="w-full relative z-20">
      
      <DashboardHero scrollContainerRef={scrollContainerRef} cmsData={cmsData} />

      <div className="w-full flex flex-col items-center px-6 pb-32">
        
        {/* SECTION: The Future of SEO */}
        <motion.section 
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}
        className="flex flex-col items-center pt-24 mb-32 max-w-5xl w-full"
      >
        <motion.div variants={item} className="text-center mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">{dashboard.sectionHeadline}</h2>
          <p className="text-white/60 text-lg font-normal leading-relaxed">{dashboard.sectionDescription}</p>
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-3xl p-8 glow-indigo relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-electric/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-electric" />
              </div>
              <h3 className="font-semibold text-xl tracking-tighter">{metrics[0].title}</h3>
            </div>
            <p className="text-white/50 text-base mb-8 leading-relaxed">{metrics[0].description}</p>
            <div className="h-40 flex items-end justify-between gap-3 opacity-90 mt-auto px-2">
              {[40, 70, 45, 90, 60, 110, 85].map((h, i) => (
                <motion.div key={i} className="w-full bg-electric/30 rounded-t-md hover:bg-electric/80 cursor-pointer transition-all duration-300" variants={{ hidden: { height: 0 }, show: { height: `${(h / 120) * 100}%` } }} />
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-3xl p-8 glow-indigo flex flex-col justify-center items-center backdrop-blur-xl text-center">
            <div className="flex items-center space-x-4 mb-8 w-full justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-xl tracking-tighter">{metrics[1].title}</h3>
            </div>
            <div className="relative w-40 h-40 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/10" />
                <motion.circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" variants={{ hidden: { strokeDasharray: 440, strokeDashoffset: 440 }, show: { strokeDashoffset: 440 * (1 - (metrics[1].score! / 100)) } }} transition={{ duration: 2, ease: "easeOut" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold tracking-tighter">{metrics[1].score}%</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">{metrics[1].description}</p>
          </motion.div>
        </div>

        {/* AI Citation Insights */}
        <motion.div variants={item} className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 glow-indigo backdrop-blur-xl mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {dashboard.citations.badge}
              </div>
              <h3 className="font-bold text-2xl tracking-tighter mb-4">{dashboard.citations.title}</h3>
              <p className="text-white/60 text-base leading-relaxed max-w-sm">{dashboard.citations.description}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {dashboard.citations.quotes.map((quote: string, idx: number) => (
                <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5 border-l-2 border-l-white/20 hover:border-l-indigo-400 transition-colors">
                  <p className="text-sm text-white/80 italic leading-relaxed">{quote}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.section>

      {/* SECTION: Built for Crawler-First Era */}
      <motion.section 
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center"
      >
        <motion.div variants={item} className="flex flex-col text-left">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight">{crawlerEra.headline}</h2>
          <p className="text-white/60 text-lg font-normal leading-relaxed mb-8">{crawlerEra.description}</p>
          <div className="flex flex-col gap-4">
            {crawlerEra.bullets.map((bullet: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">{bullet}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Code Mockup */}
        <motion.div variants={item} className="relative w-full rounded-2xl border border-white/10 bg-[#0B0C10] shadow-2xl overflow-hidden glow-indigo">
          <div className="w-full h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-4 text-xs font-mono text-white/40">{crawlerEra.codeHeader || 'llms.txt'}</span>
          </div>
          <div className="p-6 h-[260px] overflow-hidden">
            <pre className="text-sm font-mono leading-relaxed text-white/70 overflow-x-auto">
              <code className="block">
                {crawlerEra.codeContent.split('\n').map((line: string, lineIdx: number) => {
                  let color = 'text-white/70';
                  if (line.includes(': ')) color = 'text-blue-400';
                  if (line.startsWith('#')) color = 'text-gray-500';
                  if (line.includes('- /')) color = 'text-purple-400';
                  
                  return (
                    <motion.div 
                      key={lineIdx} 
                      className={`${color} mb-1 h-5 overflow-hidden whitespace-pre flex items-center`}
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        duration: line.length * 0.015,
                        delay: lineIdx * 0.12,
                        ease: "linear"
                      }}
                    >
                      {line}
                    </motion.div>
                  );
                })}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-indigo-500 translate-y-0.5"
                />
              </code>
            </pre>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium">{crawlerEra.codeBadge}</span>
          </div>
        </motion.div>
      </motion.section>

      {/* SECTION: Understand Your Audience */}
      <motion.section 
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}
        className="w-full max-w-5xl flex flex-col items-center mb-32"
      >
        <motion.div variants={item} className="text-center mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">{audience.headline}</h2>
          <p className="text-white/60 text-lg font-normal leading-relaxed">{audience.subtext}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {audience.personas.map((persona: { title: string; tag: string; bullets: string[] }, idx: number) => (
            <motion.div key={idx} variants={item} className="bg-white/5 border border-white/10 rounded-3xl p-8 glow-indigo backdrop-blur-xl flex flex-col">
              <div className="flex items-center space-x-4 mb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {idx === 0 ? <User className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-xl tracking-tighter">{persona.title}</h3>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${idx === 0 ? 'text-indigo-400' : 'text-emerald-400'}`}>{persona.tag}</span>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col gap-4">
                {persona.bullets.map((bullet: string, bIdx: number) => (
                  <div key={bIdx} className="flex items-center gap-3">
                    {idx === 0 ? <Target className="w-4 h-4 text-indigo-400/80" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />}
                    <span className="text-white/80 text-sm font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* SECTION: Testimonials Marquee */}
      <Testimonials />

      {/* SECTION: Dynamic Pricing Table */}
      <PricingTable cmsData={cmsData} />

      {/* SECTION: Bottom CTA */}
      <motion.section 
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={container}
        className="w-full max-w-5xl"
      >
        <motion.div variants={item} className="relative w-full rounded-[2.5rem] bg-white/5 border border-white/10 p-12 md:p-20 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 glow-indigo opacity-30 mix-blend-screen pointer-events-none"></div>
          
          <h2 className="relative z-10 text-4xl md:text-5xl font-bold tracking-tighter mb-6">{cta.headline}</h2>
          <p className="relative z-10 text-white/60 text-lg font-normal leading-relaxed mb-10 max-w-xl mx-auto">{cta.subtext}</p>
          
          <button className="relative z-10 px-8 py-4 rounded-full bg-[#6366f1] text-white font-semibold transition-all hover:bg-[#4f46e5] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105">
            {cta.button}
          </button>
        </motion.div>
      </motion.section>

      </div>
    </div>
  );
}
