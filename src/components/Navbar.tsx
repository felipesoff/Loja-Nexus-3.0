import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Settings, Home, Menu, X, User, LogOut, Package, ChevronDown, FolderHeart, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { cart, collections } = useStore();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = React.useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const activeCollections = collections.filter(c => c.active);
  const parentCollections = activeCollections.filter(c => !c.parentId);
  const getSubCollections = (parentId: string) => activeCollections.filter(c => c.parentId === parentId);

  const navLinks = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Carrinho', path: '/cart', icon: ShoppingCart, badge: cartCount },
    ...(user ? [{ name: 'Meus Pedidos', path: '/my-orders', icon: Package }] : []),
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0B0F17]/80 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#CCFF00] rounded-lg md:rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-black font-bold text-lg md:text-xl">N</span>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tighter text-white uppercase group-hover:text-[#CCFF00] transition-colors">NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {/* Collections Dropdown (Mega Menu) */}
            <div 
              className="relative"
              onMouseLeave={() => setIsCollectionsOpen(false)}
            >
              <button
                onMouseEnter={() => setIsCollectionsOpen(true)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#CCFF00] h-16",
                  isCollectionsOpen ? "text-[#CCFF00]" : "text-gray-400"
                )}
              >
                <FolderHeart size={18} />
                Coleções
                <ChevronDown size={14} className={cn("transition-transform", isCollectionsOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isCollectionsOpen && (
                  <>
                    {/* Invisible bridge to prevent closing when moving mouse from button to menu */}
                    <div className="absolute top-full left-0 w-full h-2" />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="fixed top-16 left-0 w-full bg-[#131924] shadow-2xl border-b border-gray-800 py-12 px-4 sm:px-6 lg:px-8 z-50"
                    >
                      <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
                          {parentCollections.map((collection) => {
                            const subCollections = getSubCollections(collection.id);
                            return (
                              <div key={collection.id} className="space-y-4">
                                <Link
                                  to={`/?collection=${encodeURIComponent(collection.name)}`}
                                  onClick={() => setIsCollectionsOpen(false)}
                                  className="block text-sm font-black text-white uppercase tracking-tighter hover:text-[#CCFF00] transition-colors"
                                >
                                  {collection.name}
                                </Link>
                                
                                {subCollections.length > 0 && (
                                  <div className="flex flex-col gap-2">
                                    {subCollections.map(sub => (
                                      <Link
                                        key={sub.id}
                                        to={`/?collection=${encodeURIComponent(sub.name)}`}
                                        onClick={() => setIsCollectionsOpen(false)}
                                        className="text-sm font-medium text-gray-400 hover:text-[#CCFF00] transition-colors flex items-center gap-2"
                                      >
                                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                        {sub.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {parentCollections.length === 0 && (
                          <div className="text-center py-12">
                            <FolderHeart size={48} className="mx-auto text-gray-800 mb-4" />
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Nenhuma coleção ativa</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#CCFF00]",
                  location.pathname === link.path ? "text-[#CCFF00]" : "text-gray-400"
                )}
              >
                <link.icon size={18} />
                {link.name}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-300" />
                  </div>
                  <span className="text-sm font-bold text-white">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-[#CCFF00] transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-[#CCFF00] text-black text-sm font-black rounded-xl hover:bg-[#b5e000] transition-all"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-[#CCFF00]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#131924] border-b border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Main Navigation Links at the top for Mobile */}
              <div className="space-y-2">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navegação</p>
                <div className="grid grid-cols-1 gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-colors",
                        location.pathname === link.path ? "bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10" : "text-gray-300 hover:bg-gray-800/30"
                      )}
                    >
                      <link.icon size={20} />
                      <span className="font-bold text-sm">{link.name}</span>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Section */}
              <div className="space-y-2">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conta</p>
                {user ? (
                  <div className="p-3 rounded-2xl bg-[#0B0F17] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                        <User size={20} className="text-gray-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{user.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{user.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setIsOpen(false); }}
                      className="w-full py-3 bg-gray-800 text-red-400 font-bold text-xs rounded-xl border border-gray-700 shadow-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} /> Sair da Conta
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 bg-[#CCFF00] text-black font-black rounded-2xl shadow-xl shadow-[#CCFF00]/10 hover:bg-[#b5e000] transition-all"
                  >
                    <User size={20} />
                    <span>Entrar / Cadastrar</span>
                    <ChevronRight size={16} className="ml-auto opacity-50" />
                  </Link>
                )}
              </div>

              {/* Mobile Collections */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coleções</p>
                <div className="grid grid-cols-2 gap-3">
                  {parentCollections.map((collection) => {
                    const subCollections = getSubCollections(collection.id);
                    return (
                      <div key={collection.id} className="space-y-2">
                        <Link
                          to={`/?collection=${encodeURIComponent(collection.name)}`}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col gap-2 p-2 rounded-2xl bg-[#0B0F17] hover:bg-gray-800 transition-colors group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden shadow-sm">
                            <img 
                              src={collection.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop'} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          <span className="text-[11px] font-bold text-white text-center truncate px-1 uppercase tracking-tighter">{collection.name}</span>
                        </Link>
                        {subCollections.length > 0 && (
                          <div className="flex flex-col gap-1.5 px-2">
                            {subCollections.map(sub => (
                              <Link
                                key={sub.id}
                                to={`/?collection=${encodeURIComponent(sub.name)}`}
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-bold text-gray-500 hover:text-[#CCFF00] uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    
    {/* Mobile Bottom Navigation Bar */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#131924]/95 backdrop-blur-md border-t border-gray-800 py-3 px-6 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <Link 
        to="/" 
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
          location.pathname === '/' ? "text-[#CCFF00]" : "text-gray-400 hover:text-white"
        )}
      >
        <Home size={18} />
        <span>Início</span>
      </Link>
      <a 
        href="/#products-grid" 
        onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
      >
        <Package size={18} />
        <span>Mantos</span>
      </a>
      <Link 
        to="/cart" 
        className={cn(
          "relative flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
          location.pathname === '/cart' ? "text-[#CCFF00]" : "text-gray-400 hover:text-white"
        )}
      >
        <ShoppingCart size={18} />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[15px] text-center">
            {cartCount}
          </span>
        )}
        <span>Carrinho</span>
      </Link>
      <Link 
        to={user ? "/my-orders" : "/login"} 
        className={cn(
          "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
          location.pathname === '/my-orders' || location.pathname === '/login' || location.pathname === '/signup' ? "text-[#CCFF00]" : "text-gray-400 hover:text-white"
        )}
      >
        <User size={18} />
        <span>Perfil</span>
      </Link>
    </div>
    </>
  );
};
