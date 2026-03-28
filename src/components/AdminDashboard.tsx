import { useState, useEffect } from 'react';
import {
  Save, ArrowLeft, Type, MousePointerClick, AlignLeft, Settings, LogOut,
  List, DollarSign, Plus, Trash2, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingPlan {
  id?: string;
  name: string;
  price: string;
  price_yearly?: string;
  description: string;
  features_list: string[];
  is_popular: boolean;
}

const DEFAULT_PRICING: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    price_yearly: '0',
    description: 'Perfect for individuals and small projects just getting started.',
    features_list: ['Basic LLMs.txt generation', 'Up to 3 pages indexed', 'Community support', 'Standard refresh rate'],
    is_popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    price_yearly: '23',
    description: 'Advanced tools for growing businesses that need real-time AI discoverability.',
    features_list: ['Unlimited LLMs.txt generation', 'Real-time syncing', 'Priority support', 'Advanced analytics', 'Custom sitemap hints'],
    is_popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    price_yearly: 'Custom',
    description: 'Dedicated solutions for large-scale operations and enterprise teams.',
    features_list: ['Everything in Pro', 'Dedicated success manager', 'Custom AI fine-tuning', 'SLA guarantee', 'White-labeling', 'SSO & team management'],
    is_popular: false,
  },
];

export default function AdminDashboard({ currentData, onPublish, onBack }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPublish: (data: any) => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'hero' | 'pricing'>('pricing');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    headlinePrefix: currentData.hero?.headlinePrefix || 'Get discovered ',
    headlineGradient: currentData.hero?.headlineGradient || 'by AI',
    description: currentData.hero?.description || 'Search engines used to crawl your HTML. AI models crawl your logic.',
    cta: currentData.hero?.buttons?.primary || 'Start Optimizing',
    features: JSON.stringify(currentData.features || [], null, 2),
  });

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    async function loadPricing() {
      const { data } = await supabase
        .from('site_content')
        .select('pricing')
        .eq('id', 1)
        .single();

      if (data?.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: PricingPlan[] = data.pricing.map((p: any, i: number) => ({
          id: p.id || p.plan?.toLowerCase().replace(/\s/g, '_') || `plan_${i}`,
          name: p.name || p.plan || 'Plan',
          price: (p.price?.toString() || '0').replace('$', ''),
          price_yearly: (p.price_yearly?.toString() || p.price?.toString() || '0').replace('$', ''),
          description: p.description || DEFAULT_PRICING[i]?.description || '',
          features_list: Array.isArray(p.features_list) && p.features_list.length > 0
            ? p.features_list
            : DEFAULT_PRICING[i]?.features_list || [],
          is_popular: p.is_popular ?? DEFAULT_PRICING[i]?.is_popular ?? false,
        }));
        // Pad to 3
        while (normalized.length < 3) normalized.push({ ...DEFAULT_PRICING[normalized.length] });
        setPricingPlans(normalized);
      } else {
        setPricingPlans([...DEFAULT_PRICING]);
      }
    }
    loadPricing();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      let parsedFeatures;
      try { parsedFeatures = JSON.parse(formData.features); }
      catch { alert('Invalid JSON in Features. Please fix the formatting.'); setIsSaving(false); return; }

      const { error } = await supabase
        .from('site_content')
        .update({ pricing: pricingPlans })
        .eq('id', 1);

      if (error) { alert('Failed to save pricing. Check console.'); console.error(error); setIsSaving(false); return; }

      onPublish({ ...formData, features: parsedFeatures, pricing: pricingPlans });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePlan = (idx: number, field: keyof PricingPlan, value: any) => {
    setPricingPlans(plans => plans.map((p, i) => {
      if (i !== idx) return field === 'is_popular' && value === true ? { ...p, is_popular: false } : p;
      return { ...p, [field]: value };
    }));
  };

  const addPlan = () => {
    setPricingPlans(prev => [...prev, {
      id: `plan_${Date.now()}`, name: 'New Plan', price: '49', price_yearly: '39',
      description: 'Describe this plan.', features_list: ['Feature one', 'Feature two'], is_popular: false,
    }]);
  };

  const removePlan = (idx: number) => setPricingPlans(prev => prev.filter((_, i) => i !== idx));

  const cols = pricingPlans.length;
  const gridCols = `200px repeat(${cols}, 1fr)`;

  // ── Input class helpers ──────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all";
  const yearlyInputStyle: React.CSSProperties = { background: '#fffef5', border: '1px solid #fde68a', width: '100%', padding: '8px 12px 8px 28px', borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none' };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F8FA] text-[#111] font-sans overflow-y-auto">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-gray-900">
            <Settings className="w-5 h-5 text-gray-400" />
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent hover:border-red-100 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button onClick={handlePublish} disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-60"
            style={{ background: saveSuccess ? '#10b981' : '#111', color: 'white' }}>
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : saveSuccess ? 'Published!' : 'Publish Changes'}
          </button>
        </div>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-[65px] z-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex gap-0 px-6">
          {(['pricing', 'hero'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2"
              style={{ borderColor: activeTab === tab ? '#111' : 'transparent', color: activeTab === tab ? '#111' : '#999' }}>
              {tab === 'hero' ? '✦ Hero Content' : '$ Pricing Plans'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto py-10 px-6 fade-in">

        {/* ════════════════════════════════════════════════════════════════
            PRICING TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Pricing Plans</h2>
                <p className="text-gray-500 text-sm">
                  Edit all tiers side-by-side. The <span className="font-semibold text-amber-600">Yearly Price</span> row is highlighted — it shows when viewers click "Yearly" on the pricing toggle.
                </p>
              </div>
              <button onClick={addPlan}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#111', color: 'white' }}>
                <Plus className="w-3.5 h-3.5" /> Add Plan
              </button>
            </div>

            {pricingPlans.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm" style={{ overflowX: 'auto' }}>

                {/* ── Column headers ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100" />
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-5 py-4 flex items-center justify-between border-r border-gray-100 last:border-r-0"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.04)' : 'white' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: plan.is_popular ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#f3f4f6', color: plan.is_popular ? 'white' : '#6b7280' }}>
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{plan.name || 'Plan'}</span>
                        {plan.is_popular && (
                          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">Popular</span>
                        )}
                      </div>
                      <button onClick={() => removePlan(idx)} className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ── Row: Plan Name ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100 flex items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Plan Name</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-3 border-r border-gray-100 last:border-r-0"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.02)' : 'white' }}>
                      <input type="text" value={plan.name} placeholder="e.g. Pro"
                        onChange={e => updatePlan(idx, 'name', e.target.value)}
                        className={inputCls} />
                    </div>
                  ))}
                </div>

                {/* ── Row: Monthly Price ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100 flex flex-col justify-center gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Monthly Price</span>
                    <span className="text-[10px] text-gray-400">Number or "Custom"</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-3 border-r border-gray-100 last:border-r-0"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.02)' : 'white' }}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                        <input type="text" value={plan.price} placeholder="29"
                          onChange={e => updatePlan(idx, 'price', e.target.value.replace(/^\$/, ''))}
                          className={`${inputCls} pl-7`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Row: Yearly Price ── HIGHLIGHTED ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 border-r border-gray-100 flex flex-col justify-center gap-0.5"
                    style={{ background: '#fffbeb' }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">★ Yearly Price</span>
                    <span className="text-[10px] text-amber-600">Displayed on "Yearly" toggle</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-3 border-r border-gray-100 last:border-r-0"
                      style={{ background: '#fffef5' }}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-sm pointer-events-none">$</span>
                        <input
                          type="text"
                          value={plan.price_yearly || ''}
                          placeholder="23"
                          onChange={e => updatePlan(idx, 'price_yearly', e.target.value.replace(/^\$/, ''))}
                          style={yearlyInputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245,158,11,0.1)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#fde68a'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                      </div>
                      {plan.price && plan.price_yearly &&
                        plan.price !== 'Custom' && plan.price_yearly !== 'Custom' &&
                        !isNaN(+plan.price) && !isNaN(+plan.price_yearly) && +plan.price > 0 && (
                        <p className="text-[10px] text-amber-600 mt-1.5 font-semibold">
                          Save {Math.round((1 - +plan.price_yearly / +plan.price) * 100)}% vs monthly
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Row: Description ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100 flex items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Description</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-3 border-r border-gray-100 last:border-r-0"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.02)' : 'white' }}>
                      <textarea rows={3} value={plan.description} placeholder="Describe this plan..."
                        onChange={e => updatePlan(idx, 'description', e.target.value)}
                        className={`${inputCls} resize-none leading-relaxed`} />
                    </div>
                  ))}
                </div>

                {/* ── Row: Features ── */}
                <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100 flex flex-col justify-start gap-0.5 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Features</span>
                    <span className="text-[10px] text-gray-400">One per line</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-3 border-r border-gray-100 last:border-r-0"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.02)' : 'white' }}>
                      <textarea
                        rows={Math.max(4, (plan.features_list || []).length + 1)}
                        value={(plan.features_list || []).join('\n')}
                        placeholder={"Real-time syncing\nPriority support\nAdvanced analytics"}
                        onChange={e => updatePlan(idx, 'features_list',
                          e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean))}
                        className={`${inputCls} font-mono resize-y leading-relaxed`} />
                      <p className="text-[10px] text-gray-400 mt-1">
                        {(plan.features_list || []).length} feature{(plan.features_list || []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Row: Most Popular toggle ── */}
                <div className="grid" style={{ gridTemplateColumns: gridCols, minWidth: 640 }}>
                  <div className="px-5 py-4 bg-gray-50 border-r border-gray-100 flex items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Most Popular</span>
                  </div>
                  {pricingPlans.map((plan, idx) => (
                    <div key={idx} className="px-4 py-4 border-r border-gray-100 last:border-r-0 flex items-center gap-3"
                      style={{ background: plan.is_popular ? 'rgba(99,102,241,0.04)' : 'white' }}>
                      <button
                        onClick={() => updatePlan(idx, 'is_popular', !plan.is_popular)}
                        className="relative w-10 h-5 rounded-full flex-shrink-0 transition-all duration-200"
                        style={{ background: plan.is_popular ? '#6366f1' : '#d1d5db' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                          style={{ left: plan.is_popular ? 'calc(100% - 18px)' : '2px' }} />
                      </button>
                      <span className="text-sm font-semibold" style={{ color: plan.is_popular ? '#4f46e5' : '#9ca3af' }}>
                        {plan.is_popular ? '✦ Featured' : 'Off'}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {pricingPlans.length === 0 && (
              <div className="text-center py-14 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                <DollarSign className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                No pricing plans yet. Click <strong>"Add Plan"</strong> to get started.
              </div>
            )}

            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-indigo-600" strokeWidth={2.5} />
              </div>
              <p className="text-sm text-indigo-700 leading-relaxed">
                <strong>Live sync:</strong> Click "Publish Changes" to save all edits to{' '}
                <code className="bg-indigo-100 px-1 rounded text-xs">site_content.pricing</code> in Supabase —
                your live pricing section updates instantly.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            HERO TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Hero Section</h2>
              <p className="text-gray-500 text-sm">Edit the headline, description, and CTA button on your landing page.</p>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 space-y-8">

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Type className="w-4 h-4 text-gray-400" /><h3>Hero Headline</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Prefix Text</label>
                      <input type="text" name="headlinePrefix" value={formData.headlinePrefix} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Gradient Text</label>
                      <input type="text" name="headlineGradient" value={formData.headlineGradient} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm" />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <AlignLeft className="w-4 h-4 text-gray-400" /><h3>Hero Description</h3>
                  </div>
                  <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm resize-none leading-relaxed" />
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MousePointerClick className="w-4 h-4 text-gray-400" /><h3>Primary CTA Button</h3>
                  </div>
                  <input type="text" name="cta" value={formData.cta} onChange={handleChange}
                    className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm" />
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <List className="w-4 h-4 text-gray-400" /><h3>Features Config (JSON)</h3>
                  </div>
                  <textarea name="features" rows={7} value={formData.features} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm font-mono text-gray-700 resize-y leading-relaxed" />
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .fade-in { animation: fadeIn 0.35s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
