import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Check, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketingConfig {
  popupActive: boolean;
  popupTitle: string;
  popupMessage: string;
  popupCoupon: string;
  
  toastActive: boolean;
  toastBuyers: string[];
  toastLocations: string[];
  toastInterval: number;
}

const DEFAULT_MARKETING_CONFIG: MarketingConfig = {
  popupActive: true,
  popupTitle: '🔥 BEM-VINDO À NEXUS STORE!',
  popupMessage: 'Cadastre seu e-mail e ganhe 10% DE DESCONTO na sua primeira compra com o cupom especial abaixo!',
  popupCoupon: 'NEXUS10',
  
  toastActive: true,
  toastBuyers: [
    'Thiago', 'Amanda', 'Lucas', 'Carla', 'Felipe', 'Juliana',
    'Rafael', 'Bruna', 'Matheus', 'Fernanda', 'Diego', 'Isabela',
    'Victor', 'Larissa', 'Gabriel', 'Camila', 'Rodrigo', 'Beatriz',
    'Anderson', 'Patricia', 'Leonardo', 'Vanessa'
  ],
  toastLocations: [
    'São Paulo/SP', 'Rio de Janeiro/RJ', 'Belo Horizonte/MG',
    'Porto Alegre/RS', 'Curitiba/PR', 'Recife/PE',
    'Salvador/BA', 'Brasília/DF', 'Fortaleza/CE',
    'Manaus/AM', 'Goiânia/GO', 'Campinas/SP'
  ],
  toastInterval: 20
};

export const MarketingWidgets: React.FC = () => {
  const { products } = useStore();
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<MarketingConfig>(() => {
    try {
      const saved = localStorage.getItem('nexus_marketing_config');
      return saved ? JSON.parse(saved) : DEFAULT_MARKETING_CONFIG;
    } catch {
      return DEFAULT_MARKETING_CONFIG;
    }
  });

  // Modal State
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast State
  const [toastData, setToastData] = useState<{
    buyer: string;
    city: string;
    productName: string;
    productId: string;
    productImage: string;
    size: string;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and subscribe to config changes
  useEffect(() => {
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem('nexus_marketing_config');
        setConfig(saved ? JSON.parse(saved) : DEFAULT_MARKETING_CONFIG);
      } catch {
        setConfig(DEFAULT_MARKETING_CONFIG);
      }
    };

    window.addEventListener('nexus_marketing_config_updated', loadConfig);
    return () => {
      window.removeEventListener('nexus_marketing_config_updated', loadConfig);
    };
  }, []);

  // Welcome Promo Popup Trigger
  useEffect(() => {
    if (!config.popupActive) return;
    
    const dismissed = sessionStorage.getItem('nexus_popup_dismissed');
    if (dismissed === 'true') return;

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [config.popupActive]);

  // Social Proof Toast Loop Trigger
  useEffect(() => {
    if (!config.toastActive || products.length === 0) {
      setShowToast(false);
      if (toastTimerRef.current) clearInterval(toastTimerRef.current);
      return;
    }

    const triggerRandomToast = () => {
      const activeProducts = products.filter(p => p.active);
      if (activeProducts.length === 0) return;

      const randomProduct = activeProducts[Math.floor(Math.random() * activeProducts.length)];
      const randomBuyer = config.toastBuyers[Math.floor(Math.random() * config.toastBuyers.length)];
      const randomLocation = config.toastLocations[Math.floor(Math.random() * config.toastLocations.length)];
      const sizes = ['P', 'M', 'G', 'GG'];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

      setToastData({
        buyer: randomBuyer,
        city: randomLocation.split('/')[0],
        productName: randomProduct.name,
        productId: randomProduct.id,
        productImage: randomProduct.image || '',
        size: randomSize
      });

      setShowToast(true);

      // Dismiss toast after 6 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 6000);
    };

    // First toast after 10s
    const firstTimer = setTimeout(() => {
      triggerRandomToast();
    }, 10000);

    // Loop interval
    toastTimerRef.current = setInterval(triggerRandomToast, config.toastInterval * 1000);

    return () => {
      clearTimeout(firstTimer);
      if (toastTimerRef.current) clearInterval(toastTimerRef.current);
    };
  }, [config.toastActive, config.toastInterval, config.toastBuyers, config.toastLocations, products]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('nexus_popup_dismissed', 'true');
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    // Save lead in localStorage leads history (simulating backend lead capture)
    try {
      const savedLeads = localStorage.getItem('nexus_leads');
      const leads = savedLeads ? JSON.parse(savedLeads) : [];
      leads.push({ email, date: new Date().toISOString() });
      localStorage.setItem('nexus_leads', JSON.stringify(leads));
    } catch (err) {
      console.error(err);
    }

    setLeadCaptured(true);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(config.popupCoupon).then(() => {
      setCopied(true);
      setTimeout(() => {
        handleClosePopup();
      }, 1500);
    });
  };

  return (
    <>
      {/* Promo Welcome Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-[#131924] border border-gray-800 p-8 rounded-[32px] text-center shadow-2xl overflow-hidden"
            >
              {/* Neon border decoration */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
              
              <button 
                onClick={handleClosePopup}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-[#CCFF00]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#CCFF00]">
                <Gift size={32} />
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-3 leading-tight">
                {config.popupTitle}
              </h3>
              
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {config.popupMessage}
              </p>

              {!leadCaptured ? (
                <form onSubmit={handleSubmitLead} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email"
                      required
                      placeholder="Seu melhor e-mail..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] text-sm transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#b5e000] transition-colors shadow-lg shadow-[#CCFF00]/10"
                  >
                    Liberar Meu Desconto
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div 
                    onClick={handleCopyCoupon}
                    className="cursor-pointer bg-[#0B0F17] hover:bg-gray-900 border-2 border-dashed border-gray-800 rounded-2xl p-5 transition-all group active:scale-95"
                  >
                    <span className="block font-black text-[#CCFF00] text-2xl tracking-widest uppercase mb-1">
                      {config.popupCoupon}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
                      {copied ? '✓ COPIADO!' : 'Clique para copiar'}
                    </span>
                  </div>
                  
                  {copied && (
                    <p className="text-[#CCFF00] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
                      <Check size={14} /> Cupom copiado com sucesso!
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Proof Purchase Toast */}
      <AnimatePresence>
        {showToast && toastData && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, y: 20 }}
            onClick={() => navigate(`/product/${toastData.productId}`)}
            className="cursor-pointer fixed bottom-20 md:bottom-6 left-4 right-4 md:right-auto md:max-w-sm z-50 bg-[#131924]/95 backdrop-blur-md border border-gray-800 p-4 rounded-2xl shadow-2xl flex gap-4 items-center group overflow-hidden"
          >
            {/* shrinking progress bar indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CCFF00]/30">
              <div 
                className="h-full bg-[#CCFF00]"
                style={{
                  animation: 'toastProgress 6s linear forwards'
                }}
              />
            </div>

            {toastData.productImage && (
              <div className="w-12 h-12 rounded-lg bg-[#0B0F17] flex-shrink-0 overflow-hidden border border-gray-800">
                <img 
                  src={toastData.productImage} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
            )}

            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-black text-white leading-tight mb-0.5 truncate">
                {toastData.buyer} <span className="text-gray-400 font-medium">de {toastData.city}</span>
              </p>
              <p className="text-[10px] text-gray-300 font-bold leading-normal truncate uppercase tracking-tight">
                comprou a {toastData.productName} <span className="text-[#CCFF00]">({toastData.size})</span>
              </p>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowToast(false);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded style tag for the custom toast shrink animation */}
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
};
