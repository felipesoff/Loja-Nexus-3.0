import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const TikTokIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.73 4.12 1.13 1.09 2.69 1.63 4.26 1.63v3.9c-1.74-.01-3.41-.6-4.75-1.71-.12.44-.12.91-.12 1.37-.01 3.73-.02 7.47-.02 11.2 0 .9-.18 1.83-.59 2.64-1.02 2.01-3.23 3.32-5.48 3.35-3.08.06-5.88-2.03-6.6-5.02-.92-3.45.89-7.23 4.24-8.08.57-.14 1.16-.19 1.75-.19.01 1.34 0 2.68.01 4.01-.84.03-1.69.29-2.34.85-.92.76-1.32 2.07-.98 3.22.4 1.3 1.69 2.22 3.06 2.11 1.58-.09 2.83-1.48 2.82-3.06-.01-3.32-.01-6.64-.01-9.97 0-3.14 0-6.29-.01-9.43z"/>
  </svg>
);

const PixIcon = () => (
  <svg className="h-4 w-auto" viewBox="0 0 100 100" fill="none">
    <path d="M49.9 83.2L16.7 50 49.9 16.8 83.1 50 49.9 83.2z" fill="#32BCAD"/>
    <path d="M50 75.3L24.7 50 50 24.7 75.3 50 50 75.3z" fill="#0B0F17"/>
    <path d="M50 63.8L36.2 50 50 36.2 63.8 50 50 63.8z" fill="#32BCAD"/>
  </svg>
);

const VisaIcon = () => (
  <div className="px-2 py-1 bg-[#131924] border border-gray-800 rounded flex items-center justify-center h-6 w-10">
    <span className="text-[9px] font-black italic text-white tracking-tighter">VISA</span>
  </div>
);

const MasterCardIcon = () => (
  <div className="px-2 py-1 bg-[#131924] border border-gray-800 rounded flex items-center justify-center h-6 w-10 relative overflow-hidden">
    <div className="flex gap-1 items-center justify-center w-full">
      <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B] opacity-90" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-90 -ml-2" />
    </div>
  </div>
);

const ApplePayIcon = () => (
  <div className="px-2 py-1 bg-[#131924] border border-gray-800 rounded flex items-center justify-center h-6 w-10">
    <span className="text-[9px] font-bold text-white tracking-tighter">Pay</span>
  </div>
);

const BarcodeIcon = () => (
  <div className="px-2 py-1 bg-[#131924] border border-gray-800 rounded flex items-center justify-center gap-[1.5px] h-6 w-10">
    <div className="w-[1.5px] h-full bg-white/70" />
    <div className="w-[1px] h-full bg-white/70" />
    <div className="w-[1.5px] h-full bg-white/70" />
    <div className="w-[2.5px] h-full bg-white/70" />
    <div className="w-[1px] h-full bg-white/70" />
    <div className="w-[1.5px] h-full bg-white/70" />
    <div className="w-[2px] h-full bg-white/70" />
  </div>
);

export const Footer: React.FC = () => {
  const { paymentConfig, collections } = useStore();
  const activeCollections = collections.filter(c => c.active).slice(0, 4);

  return (
    <footer className="bg-[#070A0F] text-white border-t border-gray-800/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Descricao */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#CCFF00] rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-lg">N</span>
              </div>
              <span className="text-lg font-black tracking-tighter text-white uppercase">
                NEXUS <span className="text-[#CCFF00]">STORE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              A maior e mais inovadora plataforma esportiva para apaixonados por mantos sagrados. Sinta a emoção do gramado na sua pele.
            </p>
            <div className="flex gap-4 items-center">
              {paymentConfig.instagramUrl && (
                <a 
                  href={paymentConfig.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#CCFF00] hover:scale-110 transition-transform"
                >
                  <Instagram size={20} />
                </a>
              )}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#CCFF00] hover:scale-110 transition-transform"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#CCFF00] hover:scale-110 transition-transform"
              >
                <TikTokIcon />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#CCFF00] hover:scale-110 transition-transform"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">Categorias</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-bold">
              {activeCollections.length > 0 ? (
                activeCollections.map(c => (
                  <li key={c.id}>
                    <Link to={`/?collection=${encodeURIComponent(c.name)}`} className="hover:text-[#CCFF00] transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/?collection=Nacionais" className="hover:text-[#CCFF00] transition-colors">Nacionais</Link></li>
                  <li><Link to="/?collection=Europeus" className="hover:text-[#CCFF00] transition-colors">Europeus</Link></li>
                  <li><Link to="/?collection=Seleções" className="hover:text-[#CCFF00] transition-colors">Seleções</Link></li>
                  <li><Link to="/?collection=Retrô Vintage" className="hover:text-[#CCFF00] transition-colors">Retrô Vintage</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Ajuda & Suporte */}
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">Ajuda & Suporte</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-bold">
              <li><Link to="/my-orders" className="hover:text-[#CCFF00] transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/my-orders" className="hover:text-[#CCFF00] transition-colors">Rastrear Pedido</Link></li>
              <li><Link to="/" className="hover:text-[#CCFF00] transition-colors">Guia de Tamanhos</Link></li>
              <li><Link to="/" className="hover:text-[#CCFF00] transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Pagamento */}
          <div className="space-y-6">
            <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">Métodos de Pagamento</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="px-2 py-1 bg-[#131924] border border-gray-800 rounded flex items-center justify-center h-6 w-10">
                <PixIcon />
              </div>
              <VisaIcon />
              <MasterCardIcon />
              <ApplePayIcon />
              <BarcodeIcon />
            </div>
            <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
              Nexus Store E-commerce LTDA. CNPJ: 00.000.000/0001-00. Copyright © 2026. Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-gray-900 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Desenvolvido com <span className="text-red-500">❤️</span> por Antigravity IDE - Pair Programming Partner
          </p>
        </div>
      </div>
    </footer>
  );
};
