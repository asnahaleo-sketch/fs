import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Store, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processChatQuery } from '../shopifyLogic';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I can help you find products or provide insights from our Shopify store.', isMCP: false }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: message, isMCP: false }]);
    const currentMessage = message;
    setMessage('');

    try {
      const data = await processChatQuery(currentMessage);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.reply,
        isMCP: true,
        products: data.products
      } as any]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I'm sorry, I couldn't connect to the server.",
        isMCP: false
      } as any]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans tracking-tight">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className="absolute bottom-20 right-0 w-[340px] sm:w-[380px] h-[480px] max-h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-br from-indigo-900/40 to-black/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Storefront Assistant</h3>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Connected: 4cm1ia-0e.myshopify.com</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-[#151515] text-white/90 rounded-bl-sm border border-white/5'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-indigo-400/80 mb-2 tracking-wider border-b border-white/5 pb-1">
                        <Store className="w-3 h-3" />
                        Shopify Live
                      </div>
                    )}
                    {msg.text}
                    
                    {(msg as any).products && (msg as any).products.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {(msg as any).products.map((p: any) => (
                          <div key={p.id} className="group flex flex-col p-2 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all overflow-hidden">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold truncate text-white/95">{p.title}</div>
                                <div className="text-[11px] text-indigo-300 font-medium">${parseFloat(p.price).toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              {p.description && (
                                <div className="text-[10px] text-white/40 truncate flex-1 pr-2 italic">
                                  {p.description}
                                </div>
                              )}
                              <a 
                                href={p.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
                              >
                                Buy <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-black/60 shrink-0 backdrop-blur-md">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about a product..."
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-[#222] transition-all"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-1.5 p-2 bg-indigo-600 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/30 text-white rounded-full transition-colors flex items-center justify-center transform active:scale-95 duration-150"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-white border border-white/20 text-black shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center justify-center hover:bg-gray-100 transition-colors relative z-10 glow-white"
        aria-label="Toggle chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
