import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import content from '../content.json';

const testimonials = [...content.testimonials, ...content.testimonials]; // Duplicate for seamless loop

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="w-[350px] shrink-0 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl glow-indigo hover:bg-white/10 transition-colors mx-4 flex flex-col h-full relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-6 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors">
      <Quote className="w-12 h-12" />
    </div>
    
    <div className="flex gap-1 mb-6">
      {[...Array(item.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
      ))}
    </div>

    <p className="text-white/80 text-sm leading-relaxed mb-8 italic relative z-10 flex-grow">
      "{item.text}"
    </p>

    <div className="flex items-center gap-4 mt-auto">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-indigo-400 font-bold">
        {item.name.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="text-white font-semibold text-base tracking-tight">{item.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs font-medium">{item.location}</span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-wider">{item.duration}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <section className="w-full py-32 overflow-hidden flex flex-col items-center">
      <div className="text-center mb-16 px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Trusted by <span className="lavender-gradient">Global Founders</span>
        </h2>
        <p className="text-white/50 text-lg max-w-2xl">
          FSEO is helping Shopify stores master AI discovery and increase their visibility in the AEO era.
        </p>
      </div>

      {/* Row 1: Left Moving */}
      <div className="flex w-full mb-8 select-none">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {testimonials.map((item, idx) => (
            <TestimonialCard key={`r1-${idx}`} item={item} />
          ))}
          {/* Duplicate for seamless loop */}
          {testimonials.map((item, idx) => (
            <TestimonialCard key={`r1-dup-${idx}`} item={item} />
          ))}
        </motion.div>
      </div>

      {/* Row 2: Right Moving */}
      <div className="flex w-full select-none">
        <motion.div 
          className="flex whitespace-nowrap"
          initial={{ x: "-50%" }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...testimonials].reverse().map((item, idx) => (
            <TestimonialCard key={`r2-${idx}`} item={item} />
          ))}
          {[...testimonials].reverse().map((item, idx) => (
            <TestimonialCard key={`r2-dup-${idx}`} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
