import { useState } from 'react';
import { Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function AdminLogin({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center font-sans tracking-tight px-6">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Site</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8 sm:p-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Admin Access</h2>
          <p className="text-sm text-gray-500">Sign in to manage page content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm"
              placeholder="admin@fseo.ai"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-800 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="opacity-70">Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
