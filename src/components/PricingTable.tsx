import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Check, Sparkles, Rocket, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Plan {
  id?: string;
  name: string;
  price: string;
  price_yearly?: string;
  description: string;
  features_list: string[];
  is_popular: boolean;
}

// ─── Hardcoded defaults (shown when CMS/Supabase has no valid data) ─────────

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    price_yearly: '0',
    description: 'Perfect for solo developers and small projects getting started with AI discoverability.',
    features_list: [
      'LLMs.txt auto-generation',
      'Up to 3 pages indexed',
      'Weekly content refresh',
      'Community support',
    ],
    is_popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    price_yearly: '23',
    description: 'Advanced tools for growing businesses that need real-time AI search visibility.',
    features_list: [
      'Unlimited page indexing',
      'Real-time LLMs.txt syncing',
      'Advanced analytics dashboard',
      'Priority support (24h SLA)',
      'Custom sitemap hints',
    ],
    is_popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    price_yearly: 'Custom',
    description: 'Dedicated infrastructure and hands-on support for agencies and large-scale teams.',
    features_list: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom AI model fine-tuning',
      'Uptime SLA guarantee',
      'White-label solution',
      'SSO & team management',
    ],
    is_popular: false,
  },
];

// ─── Normalize raw Supabase data into the Plan shape ────────────────────────

function normalizePlan(raw: any, fallback: Plan): Plan {
  const rawFeatures = raw.features_list;
  const features: string[] = Array.isArray(rawFeatures) && rawFeatures.length > 0
    ? rawFeatures
    : typeof rawFeatures === 'string' && rawFeatures.trim()
    ? rawFeatures.split(',').map((s: string) => s.trim()).filter(Boolean)
    : fallback.features_list;          // ← use default features if none stored

  const rawPrice = (raw.price ?? raw.plan_price ?? '').toString().replace(/^\$/, '');
  const rawYearly = (raw.price_yearly ?? '').toString().replace(/^\$/, '');

  return {
    id: raw.id ?? raw.plan?.toLowerCase().replace(/\s+/g, '_') ?? fallback.id,
    name: raw.name ?? raw.plan ?? fallback.name,
    price: rawPrice || fallback.price,
    price_yearly: rawYearly || rawPrice || fallback.price_yearly,
    description: raw.description || fallback.description,
    features_list: features,
    is_popular: raw.is_popular ?? fallback.is_popular,
  };
}

// ─── Icons per plan index ────────────────────────────────────────────────────

const PLAN_ICONS = [Sparkles, Rocket, Building2];

// ─── Colour tokens per plan (for non-popular styling variations) ─────────────

const PLAN_ACCENTS = [
  { icon: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  { icon: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  { icon: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)' },
];

// ═══════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PricingTable({ cmsData }: { cmsData?: any }) {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  // ── Load pricing from Supabase ────────────────────────────────────────────
  useEffect(() => {
    // Priority 1: cmsData prop (live admin preview)
    if (cmsData?.pricing && Array.isArray(cmsData.pricing) && cmsData.pricing.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = cmsData.pricing.map((raw: any, i: number) =>
        normalizePlan(raw, DEFAULT_PLANS[i] ?? DEFAULT_PLANS[0])
      );
      // Pad to exactly 3 plans
      while (normalized.length < 3) normalized.push(DEFAULT_PLANS[normalized.length]);
      setPlans(normalized);
      return;
    }

    // Priority 2: Fetch directly from Supabase
    async function fetchPricing() {
      const { data } = await supabase
        .from('site_content')
        .select('pricing')
        .eq('id', 1)
        .single();

      if (data?.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = data.pricing.map((raw: any, i: number) =>
          normalizePlan(raw, DEFAULT_PLANS[i] ?? DEFAULT_PLANS[0])
        );
        while (normalized.length < 3) normalized.push(DEFAULT_PLANS[normalized.length]);
        setPlans(normalized);
      }
      // else: keep DEFAULT_PLANS
    }
    fetchPricing();
  }, [cmsData]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="pricing"
      style={{
        width: '100%',
        padding: '7rem 1.5rem',
        position: 'relative',
        zIndex: 20,
        overflow: 'hidden',
        background: 'linear-gradient(180deg,#030305 0%,#06060f 50%,#030305 100%)',
      }}
    >
      {/* ── Ambient glows ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', width: '40%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: '10%', width: '35%', height: '45%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '9999px', marginBottom: '1.5rem',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8',
              display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase' }}>Simple Pricing</span>
          </motion.div>

          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700,
            letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.1rem', lineHeight: 1.1 }}>
            Choose your plan
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem',
            maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need to get discovered by AI.
            Start free, scale as you grow.
          </p>
        </motion.div>

        {/* ── Toggle ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.18 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem', marginTop: '1rem' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '9999px', padding: '5px',
          }}>
            {(['monthly', 'yearly'] as const).map(tab => {
              const active = (tab === 'yearly') === isYearly;
              return (
                <button
                  key={tab}
                  onClick={() => setIsYearly(tab === 'yearly')}
                  style={{
                    position: 'relative', padding: '9px 28px', borderRadius: '9999px',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    border: 'none', background: 'transparent', outline: 'none',
                    color: active ? '#000' : 'rgba(255,255,255,0.45)',
                    transition: 'color 0.2s',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="billing-pill"
                      style={{ position: 'absolute', inset: 0, borderRadius: '9999px', background: '#fff' }}
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {tab === 'monthly' ? 'Monthly' : (
                      <>Yearly <span style={{ color: active ? 'rgba(0,0,0,0.5)' : '#34d399' }}>(-20%)</span></>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Cards Grid ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          alignItems: 'stretch',
        }}>
          {plans.map((plan, idx) => {
            const Icon = PLAN_ICONS[idx % PLAN_ICONS.length];
            const accent = PLAN_ACCENTS[idx % PLAN_ACCENTS.length];
            const isCustom = plan.price.toLowerCase() === 'custom';
            const isFree = plan.price === '0';
            const currentPrice = isYearly
              ? (plan.price_yearly || plan.price)
              : plan.price;
            const btnLabel = isFree ? 'Start for Free' : isCustom ? 'Contact Sales' : 'Get Started';

            return (
              <motion.div
                key={plan.id || idx}
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.25 + idx * 0.13, duration: 0.65, ease: 'easeOut' }}
                whileHover={{ y: -7, transition: { duration: 0.28, ease: 'easeOut' } }}
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  padding: plan.is_popular ? '2px' : '1px',
                  background: plan.is_popular
                    ? 'linear-gradient(145deg,rgba(99,102,241,0.9) 0%,rgba(168,85,247,0.7) 50%,rgba(251,146,60,0.5) 100%)'
                    : 'rgba(255,255,255,0.07)',
                  cursor: 'default',
                  isolation: 'isolate',
                }}
              >
                {/* Popular badge */}
                {plan.is_popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: 0.55, duration: 0.4, ease: 'backOut' }}
                    style={{
                      position: 'absolute', top: '-16px', left: '50%',
                      transform: 'translateX(-50%)', zIndex: 10,
                      padding: '4px 16px', borderRadius: '9999px',
                      background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                      color: '#fff', fontSize: '11px', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      boxShadow: '0 0 20px rgba(99,102,241,0.6)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✦ Most Popular
                  </motion.div>
                )}

                {/* Inner card body */}
                <div style={{
                  position: 'relative', height: '100%',
                  borderRadius: plan.is_popular ? '22px' : '23px',
                  background: plan.is_popular
                    ? 'linear-gradient(160deg,#0d0d1f 0%,#09090f 100%)'
                    : 'linear-gradient(160deg,#0c0c0c 0%,#080808 100%)',
                  padding: '2rem',
                  display: 'flex', flexDirection: 'column',
                  overflow: 'hidden',
                }}>
                  {/* Radial hover glow behind content */}
                  <div className="card-glow" style={{
                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                    background: plan.is_popular
                      ? 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.14) 0%, transparent 55%)'
                      : `radial-gradient(ellipse at 50% 0%, ${accent.bg} 0%, transparent 55%)`,
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.4s',
                  }} />

                  {/* Plan header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: plan.is_popular ? 'rgba(99,102,241,0.15)' : accent.bg,
                        border: `1px solid ${plan.is_popular ? 'rgba(99,102,241,0.3)' : accent.border}`,
                      }}>
                        <Icon style={{ width: 17, height: 17, color: plan.is_popular ? '#818cf8' : accent.icon }} />
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
                        {plan.name}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65,
                    minHeight: '52px', marginBottom: '1.5rem', fontWeight: 300,
                  }}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', height: '62px', overflow: 'hidden', marginBottom: '6px' }}>
                    {isCustom ? (
                      <span style={{ fontSize: '2.6rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.3rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', alignSelf: 'flex-start', marginTop: '10px' }}>
                          $
                        </span>
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={currentPrice}
                            initial={{ opacity: 0, y: -22, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{
                              fontSize: '3.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
                              color: '#fff',
                              display: 'inline-block',
                            }}
                          >
                            {currentPrice}
                          </motion.span>
                        </AnimatePresence>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.28)', marginBottom: '10px', alignSelf: 'flex-end' }}>
                          /mo
                        </span>
                      </>
                    )}
                  </div>

                  {/* Billing note */}
                  <div style={{ height: '20px', marginBottom: '1.6rem' }}>
                    <AnimatePresence>
                      {isYearly && !isCustom && !isFree && (
                        <motion.p
                          initial={{ opacity: 0, filter: 'blur(3px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(3px)' }}
                          style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}
                        >
                          Billed annually
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.975 }}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      border: 'none', marginBottom: '1.6rem', letterSpacing: '0.01em',
                      transition: 'box-shadow 0.25s',
                      ...(plan.is_popular ? {
                        background: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                      } : {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                      }),
                    }}
                  >
                    {btnLabel}
                  </motion.button>

                  {/* Divider */}
                  <div style={{
                    width: '100%', height: '1px', marginBottom: '1.4rem',
                    background: plan.is_popular
                      ? 'linear-gradient(90deg,transparent,rgba(99,102,241,0.35),rgba(168,85,247,0.35),transparent)'
                      : 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',
                  }} />

                  {/* Features */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                      marginBottom: '1rem',
                    }}>
                      {idx === 0 ? 'Includes' : `Everything in ${plans[idx - 1]?.name ?? ''}, plus`}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {plan.features_list.map((feat, fi) => (
                        <motion.li
                          key={fi}
                          initial={{ opacity: 0, x: -8 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.45 + idx * 0.13 + fi * 0.05, duration: 0.35 }}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: plan.is_popular ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${plan.is_popular ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                            <Check style={{ width: 9, height: 9, color: plan.is_popular ? '#818cf8' : 'rgba(255,255,255,0.4)', strokeWidth: 2.5 }} />
                          </div>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.55, fontWeight: 300 }}>
                            {feat}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Footer note ────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '2.75rem',
            fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}
        >
          No hidden fees · Cancel anytime · 14-day free trial on all plans
        </motion.p>
      </div>

      {/* Hover glow CSS */}
      <style>{`
        #pricing .group:hover .card-glow { opacity: 1 !important; }
        @media (max-width: 860px) {
          #pricing > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 861px) and (max-width: 1060px) {
          #pricing > div > div[style*="grid-template-columns"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
