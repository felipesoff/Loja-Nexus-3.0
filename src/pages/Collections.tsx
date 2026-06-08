import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

import { Footer } from '../components/Footer';

export const Collections: React.FC = () => {
  const { collections, loading } = useStore();
  const navigate = useNavigate();

  const activeCollections = collections.filter(c => c.active);

  return (
    <div className="min-h-screen bg-[#0B0F17] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4">
            Nossas Coleções
          </h1>
          <p className="text-gray-400 font-medium max-w-2xl">
            Explore todo o nosso catálogo organizado por categorias e ligas. Encontre o manto perfeito para sua paixão.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="w-full h-80 rounded-[40px] bg-[#131924] border border-gray-800 animate-pulse" />
            ))
          ) : (
            activeCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => navigate(`/?collection=${encodeURIComponent(collection.name)}`)}
                  className="group relative w-full h-80 rounded-[40px] overflow-hidden border border-gray-800/80 shadow-sm transition-all hover:border-[#CCFF00]/30 hover:shadow-2xl hover:shadow-[#CCFF00]/5"
                >
                  <img 
                    src={collection.image || 'https://picsum.photos/seed/collection/800/600'} 
                    alt={collection.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end text-left">
                    <h3 className="text-white font-black text-3xl leading-tight uppercase tracking-tighter mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-white/60 text-sm font-medium mb-6 line-clamp-2">
                      {collection.description}
                    </p>
                     <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                      Explorar Coleção <ArrowRight size={16} />
                     </p>
                  </div>
                </button>
              </motion.div>
            ))
          )}
        </div>

        {activeCollections.length === 0 && (
          <div className="text-center py-20 bg-[#131924] rounded-[40px] border border-dashed border-gray-800">
            <div className="w-20 h-20 bg-[#0B0F17] rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma coleção encontrada</h3>
            <p className="text-gray-400">Estamos preparando novidades incríveis para você.</p>
            <Link to="/" className="mt-6 inline-block text-sm font-bold text-[#CCFF00] border-b-2 border-[#CCFF00] pb-1 hover:text-white hover:border-white transition-colors">
              Voltar para a Loja
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
