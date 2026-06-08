import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Filter, ShoppingCart, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { INITIAL_BANNERS } from '../constants';

import { toast } from 'sonner';

import { Footer } from '../components/Footer';

export const Storefront: React.FC = () => {
  const { products, addToCart, banners, collections, reviews, loading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection');

  const [search, setSearch] = useState('');
  const [activeLeague, setActiveLeague] = useState('Todas');
  const [activeCategory, setActiveCategory] = useState(collectionParam || 'Todas');
  const [activeSubCategory, setActiveSubCategory] = useState('Todas');
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (collectionParam) {
      setActiveCategory(collectionParam);
      // Scroll to products section if a collection is selected
      const productsSection = document.getElementById('products-grid');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [collectionParam]);

  const activeBanners = useMemo(() => banners.filter(b => b.active), [banners]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const leagues = ['Todas', ...Array.from(new Set(products.map(p => p.league)))];
  const categories = ['Todas', 'Lançamentos', ...collections.filter(c => c.active).map(c => c.name)];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.team.toLowerCase().includes(search.toLowerCase());
      const matchesLeague = activeLeague === 'Todas' || p.league === activeLeague;
      
      let matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
      
      // Guide collection logic
      if (activeCategory !== 'Todas' && activeCategory !== 'Lançamentos') {
        const selectedCollection = collections.find(c => c.name === activeCategory);
        if (selectedCollection?.isGuide) {
          // If a sub-category is selected, filter by it
          if (activeSubCategory !== 'Todas') {
            matchesCategory = p.category === activeSubCategory;
          } else {
            // Otherwise show all sub-categories
            const getSubCollectionNames = (parentId: string): string[] => {
              const children = collections.filter(c => c.parentId === parentId);
              return [
                ...children.map(c => c.name),
                ...children.flatMap(c => getSubCollectionNames(c.id))
              ];
            };
            const subCategoryNames = [selectedCollection.name, ...getSubCollectionNames(selectedCollection.id)];
            matchesCategory = subCategoryNames.includes(p.category);
          }
        }
      }

      if (activeCategory === 'Lançamentos') {
        matchesCategory = !!p.isNewArrival;
      }
      
      const matchesNewArrivals = !showNewArrivals || !!p.isNewArrival;
      
      return matchesSearch && matchesLeague && matchesCategory && matchesNewArrivals;
    });
  }, [products, search, activeLeague, activeCategory, activeSubCategory, showNewArrivals, collections]);

  const handleAddToCart = (product: any) => {
    addToCart(product, product.sizes[0]);
    toast.success('Adicionado ao carrinho!');
  };

  const currentBanner = activeBanners[currentBannerIndex] || INITIAL_BANNERS[0];

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      {/* Hero Section */}
      <section className="relative h-[75vh] md:h-[700px] overflow-hidden bg-[#0B0F17] flex items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              src={currentBanner.image || undefined} 
              alt="" 
              className="w-full h-full object-cover md:object-center object-[85%_center] opacity-60 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl w-full"
        >
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 leading-[0.9] uppercase break-words px-2">
            {currentBanner.title}
          </h1>
          <p className="text-gray-300 text-base md:text-xl mb-8 md:mb-10 font-medium max-w-2xl mx-auto leading-relaxed px-4">
            {currentBanner.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                if (currentBanner.buttonText === 'Ver Coleção') {
                  navigate('/collections');
                } else {
                  const productsSection = document.getElementById('products-grid');
                  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-[#CCFF00]/10 group uppercase tracking-tighter text-sm md:text-base"
            >
              {currentBanner.buttonText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                setShowNewArrivals(!showNewArrivals);
                const productsSection = document.getElementById('products-grid');
                if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                "w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 font-black rounded-2xl transition-all border backdrop-blur-md uppercase tracking-tighter text-sm md:text-base",
                showNewArrivals 
                  ? "bg-white text-black border-white shadow-2xl shadow-white/20" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
            >
              {showNewArrivals ? 'Ver Todos' : 'Lançamentos'}
            </button>
          </div>
        </motion.div>
        
        {activeBanners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={cn(
                  "w-12 h-1 transition-all rounded-full",
                  currentBannerIndex === idx ? "bg-white" : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Collections */}
        {collections.filter(c => c.active && c.featured).length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                  Coleções em Destaque
                </h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Confira o que há de melhor
                </p>
              </div>
              <Link 
                to="/collections"
                className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest border-b-2 border-[#CCFF00] pb-1 hover:text-white hover:border-white transition-all"
              >
                Ver Todas
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {collections.filter(c => c.active && c.featured).map((collection) => (
                <Link
                  key={collection.id}
                  to={`/?collection=${encodeURIComponent(collection.name)}`}
                  className="group relative h-48 md:h-64 rounded-2xl md:rounded-[32px] overflow-hidden border border-gray-800/80 shadow-lg"
                >
                  <img src={collection.image || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 md:p-8 flex flex-col justify-end text-left">
                    <h3 className="text-white font-black text-base md:text-2xl leading-tight uppercase tracking-tighter">{collection.name}</h3>
                    <p className="text-white/70 text-[10px] md:text-xs font-bold mt-1 md:mt-2 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                      Ver <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div id="products-grid" className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#CCFF00] transition-colors" size={20} />
              <input
                type="text"
                placeholder="Busque por time, liga ou nome da camisa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#131924] border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] text-white transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#131924] border border-gray-800 text-white rounded-xl shadow-sm">
              <Filter size={18} className="text-gray-500" />
              <select
                value={activeLeague}
                onChange={(e) => setActiveLeague(e.target.value)}
                className="bg-transparent focus:outline-none text-sm font-medium text-white [&>option]:bg-[#131924]"
              >
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#131924] border border-gray-800 text-white rounded-xl shadow-sm">
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  setActiveSubCategory('Todas');
                }}
                className="bg-transparent focus:outline-none text-sm font-medium text-white [&>option]:bg-[#131924]"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Sub-category filter for guide collections */}
            {(() => {
              const selectedCollection = collections.find(c => c.name === activeCategory);
              if (selectedCollection?.isGuide) {
                const subCollections = collections.filter(c => c.parentId === selectedCollection.id && c.active);
                if (subCollections.length > 0) {
                  return (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl shadow-sm">
                      <Filter size={14} className="text-purple-400" />
                      <select
                        value={activeSubCategory}
                        onChange={(e) => setActiveSubCategory(e.target.value)}
                        className="bg-transparent focus:outline-none text-sm font-bold text-purple-700"
                      >
                        <option value="Todas">Todas as Sub-categorias</option>
                        {subCollections.map(sc => (
                          <option key={sc.id} value={sc.name}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {loading ? (
            // Loading Skeletons
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#131924] rounded-3xl overflow-hidden border border-gray-800 animate-pulse">
                <div className="aspect-[4/5] bg-gray-800" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-6 bg-gray-800 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group bg-[#131924] rounded-2xl md:rounded-3xl overflow-hidden border border-gray-800/80 hover:border-[#CCFF00]/30 hover:shadow-2xl hover:shadow-[#CCFF00]/5 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#0B0F17]">
                  <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img
                      src={product.image || undefined}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2 pointer-events-none">
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/80 backdrop-blur-md rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-white border border-gray-800/60 shadow-sm">
                      {product.league}
                    </span>
                    {product.stock < 10 && (
                      <span className="px-2 py-0.5 md:px-3 md:py-1 bg-red-500 text-white rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Últimas
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-8 h-8 md:w-12 md:h-12 bg-[#CCFF00] text-black rounded-xl md:rounded-2xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10 hover:bg-[#b5e000]"
                  >
                    <ShoppingCart size={16} className="md:w-5 md:h-5" />
                  </button>
                </div>
                <div className="p-3 md:p-6 flex-1 flex flex-col">
                  <Link to={`/product/${product.id}`} className="block flex-1">
                    {(() => {
                      const productReviews = reviews.filter(r => r.productId === product.id && r.approved);
                      const averageRating = productReviews.length > 0
                        ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
                        : null;
                      
                      return (
                        <div className="flex items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={cn(
                                "fill-current md:w-3 md:h-3", 
                                averageRating && i < Math.round(Number(averageRating)) 
                                  ? "text-yellow-400" 
                                  : "text-gray-200"
                              )} 
                            />
                          ))}
                          <span className="text-[8px] md:text-[10px] text-gray-400 font-bold ml-1">
                            {averageRating ? `${averageRating}` : ''}
                          </span>
                        </div>
                      );
                    })()}
                    <h3 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 line-clamp-2 leading-tight group-hover:text-[#CCFF00] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] md:text-sm text-gray-400 mb-2 md:mb-4 font-medium">{product.team}</p>
                  </Link>
                  <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div className="flex flex-col">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold line-through">R$ {product.originalPrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold line-through">R$ {(product.price * 1.2).toFixed(2)}</span>
                      )}
                      <span className="text-sm md:text-xl font-black text-[#CCFF00] tracking-tighter">R$ {product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#131924] rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-400">Tente ajustar seus filtros ou termo de busca.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
