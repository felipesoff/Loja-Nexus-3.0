import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Camera, Send, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, compressImage } from '../lib/utils';
import { Review } from '../types';

import { toast } from 'sonner';

import { Footer } from '../components/Footer';

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, reviews, addReview } = useStore();
  const { user, isAdmin } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const product = products.find(p => p.id === id);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-bold">Produto não encontrado.</p>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho.');
      return;
    }
    
    const currentStock = product.sizeStock?.[selectedSize] ?? product.stock;
    if (currentStock <= 0) {
      toast.error('Este tamanho está esgotado.');
      return;
    }

    addToCart(product, selectedSize, quantity);
    toast.success('Adicionado ao carrinho!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          const compressed = await compressImage(result);
          setReviewImages(prev => [...prev, compressed]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Você precisa estar logado para avaliar.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newReview: Review = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productName: product.name,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        images: reviewImages,
        date: new Date().toISOString(),
        approved: isAdmin // Admin reviews are auto-approved
      };

      // Check document size (approximate)
      const docSize = JSON.stringify(newReview).length;
      if (docSize > 1000000) { // 1MB limit
        toast.error('A avaliação está muito pesada devido às imagens. Tente remover algumas fotos ou usar imagens menores.');
        setIsSubmitting(false);
        return;
      }

      await addReview(newReview);
      toast.success(isAdmin ? 'Avaliação publicada!' : 'Avaliação enviada para aprovação!');
      setComment('');
      setRating(5);
      setReviewImages([]);
      setShowReviewForm(false);
    } catch (error) {
      toast.error('Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productReviews = reviews.filter(r => r.productId === product.id && (r.approved || isAdmin));
  const averageRating = productReviews.length > 0
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#CCFF00] transition-colors font-bold uppercase tracking-widest text-xs mb-12"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 md:space-y-6"
          >
            <div 
              onClick={() => setZoomImage(activeImage)}
              className="aspect-[4/5] rounded-3xl md:rounded-[40px] overflow-hidden bg-[#131924] border border-gray-850/30 shadow-2xl shadow-black/5 group relative cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={activeImage || undefined}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all",
                      activeImage === img ? "border-black shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-[#CCFF00] text-black rounded-full text-[10px] font-black uppercase tracking-widest">
                  {product.league}
                </span>
                <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight uppercase">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={cn(
                        "fill-current", 
                        averageRating && i < Math.round(Number(averageRating)) 
                          ? "text-yellow-400" 
                          : "text-gray-200"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {averageRating 
                    ? `${averageRating} de 5 (${productReviews.length} ${productReviews.length === 1 ? 'avaliação' : 'avaliações'})` 
                    : 'Nenhuma avaliação'}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-[#CCFF00] tracking-tighter">R$ {product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <span className="text-lg text-gray-500 line-through font-bold">R$ {product.originalPrice.toFixed(2)}</span>
                ) : (
                  <span className="text-lg text-gray-500 line-through font-bold">R$ {(product.price * 1.2).toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="mb-10 flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selecione o Tamanho</h3>
                  {selectedSize && (
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-gray-800 px-2 py-1 rounded-full">
                      Disponível: {product.sizeStock?.[selectedSize] ?? 0}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => {
                    const stockForSize = product.sizeStock?.[size] ?? 0;
                    const isOutOfStock = stockForSize <= 0;
                    
                    return (
                      <button
                        key={size}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "w-14 h-14 rounded-2xl border-2 font-bold transition-all flex flex-col items-center justify-center relative",
                          selectedSize === size
                            ? "border-[#CCFF00] bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/10"
                            : isOutOfStock
                              ? "border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed"
                              : "border-gray-800 bg-[#131924] text-gray-400 hover:border-[#CCFF00] hover:text-white"
                        )}
                      >
                        <span>{size}</span>
                        {stockForSize > 0 && stockForSize < 5 && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-black">
                            {stockForSize}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quantidade</h3>
                <div className="flex items-center bg-[#131924] rounded-2xl border border-gray-800 p-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#0B0F17] rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-black text-lg text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-[#0B0F17] rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              <button
                onClick={handleAddToCart}
                className="w-full py-5 md:py-6 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#CCFF00]/10 group"
              >
                <ShoppingCart size={22} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                ADICIONAR AO CARRINHO
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-gray-800">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 bg-[#131924] border border-gray-800 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#CCFF00]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Compra Segura</p>
                  <p className="text-[10px] text-gray-400 font-medium">Dados protegidos</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 bg-[#131924] border border-gray-800 rounded-xl flex items-center justify-center">
                  <Truck size={20} className="text-[#CCFF00]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Envio Rápido</p>
                  <p className="text-[10px] text-gray-400 font-medium">Todo o Brasil</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Descrição do Produto</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">AVALIAÇÕES DOS CLIENTES</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {productReviews.length} {productReviews.length === 1 ? 'Avaliação' : 'Avaliações'}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-yellow-400 fill-current md:w-5 md:h-5" />
                    <span className="text-base md:text-lg font-black text-white tracking-tighter">{averageRating}</span>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-4 md:px-6 py-2.5 md:py-3 bg-white/10 text-white text-[10px] md:text-xs font-bold rounded-xl hover:bg-white/20 transition-all uppercase tracking-widest"
                  >
                    {showReviewForm ? 'Cancelar' : 'Avaliar'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-12 overflow-hidden"
                  >
                    <form onSubmit={handleSubmitReview} className="bg-[#131924] p-8 rounded-[32px] border border-gray-800">
                      <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sua Nota</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={32}
                                className={cn(
                                  "transition-colors",
                                  s <= rating ? "text-yellow-400 fill-current" : "text-gray-200"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Seu Comentário</p>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="O que você achou do produto? Fale sobre a qualidade, tamanho e entrega..."
                          className="w-full p-4 bg-[#0B0F17] border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] text-white transition-all min-h-[120px] text-sm"
                        />
                      </div>

                      <div className="mb-8">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Fotos (Opcional)</p>
                        <div className="flex flex-wrap gap-4">
                          {reviewImages.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#CCFF00] hover:bg-gray-800 transition-all text-gray-400 hover:text-white">
                            <Camera size={20} />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Add Foto</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Enviando...' : (
                          <>
                            <Send size={18} />
                            PUBLICAR AVALIAÇÃO
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                {productReviews.map((review) => (
                  <div key={review.id} className="bg-[#131924] p-6 rounded-[32px] border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{review.userName}</p>
                          {isAdmin && (
                            <span className="px-2 py-0.5 bg-[#CCFF00] text-black text-[8px] font-black rounded-full uppercase tracking-widest">Admin</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={cn("fill-current", i < review.rating ? "text-yellow-400" : "text-gray-200")} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{review.comment}"</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {review.images.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt="" 
                            onClick={() => setZoomImage(img)}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200 cursor-zoom-in hover:scale-105 transition-transform" 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {productReviews.length === 0 && (
                  <p className="text-center text-gray-400 font-medium italic py-8">
                    Nenhuma avaliação para este produto ainda. Seja o primeiro a avaliar!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
            >
              <button
                onClick={() => setZoomImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X size={32} />
              </button>
              <img
                src={zoomImage}
                alt="Zoom"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};
