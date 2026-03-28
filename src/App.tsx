import { useState, useRef, useEffect } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import CanvasBackground from './components/CanvasBackground';
import SmoothCursor from './components/SmoothCursor';
import AdminDashboard from './components/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import AdminLogin from './components/AdminLogin';
import defaultContent from './content.json';
import { Settings } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [appState, setAppState] = useState<'idle' | 'transitioning' | 'dashboard' | 'admin'>('idle');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<Session | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cmsData, setCmsData] = useState<any>(defaultContent);

  // Initialize Auth & Content
  useEffect(() => {
    // Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Content Fetch
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data && !error) {
        setCmsData({
          hero: data.hero,
          features: data.features,
          pricing: data.pricing,
          // Merge defaults for things not in DB yet
          dashboardHero: defaultContent.dashboardHero,
          dashboard: defaultContent.dashboard,
          crawlerEra: defaultContent.crawlerEra,
          audience: defaultContent.audience,
          cta: defaultContent.cta,
          footer: defaultContent.footer,
        });
      } else {
        console.error('Failed to load content from Supabase', error);
      }
    };
    fetchContent();

    return () => subscription.unsubscribe();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePublish = async (updates: any) => {
    const newHero = {
      headlinePrefix: updates.headlinePrefix,
      headlineGradient: updates.headlineGradient,
      description: updates.description,
      buttons: { primary: updates.cta, secondary: cmsData.hero?.buttons?.secondary || 'View Documentation' },
      badges: cmsData.hero?.badges || { file: 'LLM.txt File', featured: 'Featured on FixMyStore' }
    };

    const newPricing = updates.pricing ?? (cmsData as any).pricing;

    const newData = {
      ...cmsData,
      hero: newHero,
      features: updates.features || (cmsData as any).features,
      pricing: newPricing,
    };
    setCmsData(newData);

    // Save to Supabase
    const { error } = await supabase.from('site_content').update({
      hero: newHero,
      features: newData.features,
      pricing: newPricing,
    }).eq('id', 1);

    if (error) {
      console.error('Failed to save to Supabase', error);
      alert('Failed to save changes. Check console for details.');
    } else {
      setAppState('idle');
    }
  };

  // Browser Back Button Support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || event.state.page === 'idle') {
        setAppState('idle');
      } else if (event.state.page === 'dashboard') {
        setAppState('dashboard');
      } else if (event.state.page === 'admin') {
        setAppState('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const startTransition = () => {
    setAppState('transitioning');
    window.history.pushState({ page: 'dashboard' }, '');
    setTimeout(() => {
      setAppState('dashboard');
    }, 400);
  };

  if (appState === 'admin') {
    if (!session) {
      return (
        <>
          <AdminLogin onBack={() => {
            setAppState('idle');
            window.history.pushState({ page: 'idle' }, '');
          }} />
          <ChatWidget />
        </>
      );
    }

    return (
      <>
        <AdminDashboard 
          currentData={cmsData} 
          onPublish={handlePublish} 
          onBack={() => {
            setAppState('idle');
            window.history.pushState({ page: 'idle' }, '');
          }} 
        />
        <ChatWidget />
      </>
    );
  }

  return (
    <main className="relative min-h-screen bg-background overflow-hidden text-white font-sans antialiased">
      <SmoothCursor />
      
      {/* Admin Button */}
      <button 
        onClick={() => {
          setAppState('admin');
          window.history.pushState({ page: 'admin' }, '');
        }}
        className="fixed top-6 right-6 z-50 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-md text-white/70 hover:text-white"
        aria-label="Open Admin Dashboard"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Z-0: Fixed Background (Anti-Gravity Canvas) */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <CanvasBackground triggerSingularity={appState === 'transitioning'} />
      </div>

      {/* Z-1: Deep Vignette */}
      <div className="fixed inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 40%, #000 100%)' }} />
      
      {/* Z-2: The Scrolling Stage */}
      <div ref={scrollContainerRef} className="relative z-20 h-screen w-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {appState === 'idle' || appState === 'transitioning' ? (
          <Hero isTransitioning={appState === 'transitioning'} onStart={startTransition} cmsData={cmsData} />
        ) : null}

        {appState === 'dashboard' && (
          <>
            <Dashboard scrollContainerRef={scrollContainerRef} cmsData={cmsData} />
            <Footer />
          </>
        )}
      </div>

      <ChatWidget />
    </main>
  );
}
