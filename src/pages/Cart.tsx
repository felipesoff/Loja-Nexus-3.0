import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard, MapPin, LogIn, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

import { toast } from 'sonner';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, removeItemFromCart, addToCart, placeOrder, paymentConfig, validateCoupon } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerCpf, setCustomerCpf] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? paymentConfig.shippingFee : 0;
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const coupon = await validateCoupon(couponCode);
    if (coupon) {
      setAppliedCoupon(coupon);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !user) return;
    
    const orderData = {
      userId: user.id,
      customerName,
      customerEmail,
      customerCpf,
      shippingAddress,
      paymentMethod,
      couponCode: appliedCoupon?.code,
    };

    try {
      await placeOrder(orderData);
      setLastOrder(orderData);
      setOrderSuccess(true);
      toast.success('Pedido realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar pedido. Tente novamente.');
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0B0F17] py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-[#131924] p-8 md:p-12 rounded-[40px] shadow-2xl border border-gray-800"
        >
          <div className="w-20 h-20 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={32} className="text-[#CCFF00]" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase text-center">PEDIDO REALIZADO!</h2>
          <p className="text-gray-400 font-medium mb-10 text-center">
            Obrigado pela compra, {customerName}! Seu pedido já está sendo processado.
          </p>

          {lastOrder?.paymentMethod === 'pix' ? (
            <div className="bg-[#0B0F17] p-8 rounded-[32px] border border-gray-800 mb-10">
              <h3 className="text-lg font-black text-[#CCFF00] tracking-tighter mb-6 uppercase text-center">PAGAMENTO VIA PIX</h3>
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-250">
                  <img src={paymentConfig.pixQrCode || undefined} alt="QR Code PIX" className="w-48 h-48" />
                </div>
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center block">Chave PIX</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={paymentConfig.pixKey}
                        className="flex-1 px-4 py-3 bg-[#131924] border border-gray-800 rounded-xl font-mono text-sm text-center text-white"
                      />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(paymentConfig.pixKey);
                            toast.success('Chave PIX copiada!');
                          } catch (err) {
                            toast.error('Erro ao copiar chave PIX.');
                          }
                        }}
                        className="px-4 py-3 bg-[#CCFF00] text-black font-black rounded-xl hover:bg-[#b5e000] transition-colors text-xs uppercase tracking-widest"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center italic">
                    {paymentConfig.pixLegend}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B0F17] p-8 rounded-[32px] border border-gray-800 mb-10 text-center">
              <h3 className="text-lg font-black text-[#CCFF00] tracking-tighter mb-4 uppercase">PAGAMENTO VIA CARTÃO</h3>
              <p className="text-sm text-gray-350 leading-relaxed">
                {paymentConfig.creditCardInfo}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Link
              to="/my-orders"
              className="block w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all shadow-xl shadow-[#CCFF00]/10 text-center"
            >
              Ver Meus Pedidos
            </Link>
            <Link
              to="/"
              className="block w-full py-5 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700 transition-all text-center"
            >
              Voltar para a Loja
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-12 uppercase">MEU CARRINHO</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-[#131924] rounded-[40px] border border-gray-800 shadow-lg">
            <div className="w-20 h-20 bg-[#0B0F17] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Seu carrinho está vazio</h3>
            <p className="text-gray-400 mb-8">Que tal dar uma olhada nos nossos lançamentos?</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all"
            >
              Ver Produtos <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-[#131924] p-6 rounded-3xl border border-gray-800 shadow-sm flex flex-col sm:flex-row gap-6 items-center"
                  >
                    <img
                      src={item.image || undefined}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-2xl bg-[#0B0F17]"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400 mb-4">Tamanho: <span className="font-bold text-[#CCFF00]">{item.selectedSize}</span></p>
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <div className="flex items-center bg-[#0B0F17] rounded-xl border border-gray-800 p-1">
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="p-2 hover:bg-[#131924] rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-white">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item, item.selectedSize)}
                            className="p-2 hover:bg-[#131924] rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItemFromCart(item.id, item.selectedSize)}
                          className="text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-widest"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white tracking-tight">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">R$ {item.price.toFixed(2)} / un</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#131924] p-8 rounded-[40px] border border-gray-800 shadow-xl sticky top-24 text-white">
                <h2 className="text-xl font-black text-white tracking-tighter mb-8 uppercase">RESUMO DO PEDIDO</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Subtotal</span>
                    <span className="text-white font-bold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Frete</span>
                    <span className="text-white font-bold">R$ {shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span className="font-medium">Desconto ({appliedCoupon?.code})</span>
                      <span className="font-bold">- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                    <span className="text-lg font-black text-white tracking-tighter uppercase">TOTAL</span>
                    <span className="text-3xl font-black text-[#CCFF00] tracking-tighter">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-8 p-4 bg-[#0B0F17] rounded-2xl border border-gray-800">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Cupom de Desconto</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        placeholder="CUPOM10"
                        className="w-full pl-10 pr-4 py-2 bg-[#131924] border border-gray-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] text-white transition-all text-sm font-bold"
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="px-4 py-2 bg-red-950/30 text-red-400 font-bold rounded-xl hover:bg-red-900/30 transition-colors text-xs uppercase tracking-widest"
                      >
                        Remover
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#CCFF00] text-black font-black rounded-xl hover:bg-[#b5e000] transition-colors text-xs uppercase tracking-widest"
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                </div>

                {!user ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-red-400 text-center uppercase tracking-widest">Entre na sua conta para finalizar</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10"
                    >
                      Entrar na Nexus <LogIn size={20} />
                    </button>
                  </div>
                ) : !isCheckingOut ? (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-5 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#CCFF00]/10"
                  >
                    Finalizar Compra <ArrowRight size={20} />
                  </button>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo</label>
                        <input
                          required
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="Nome Completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                        <input
                          required
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</label>
                        <input
                          required
                          type="text"
                          value={customerCpf}
                          onChange={(e) => setCustomerCpf(e.target.value)}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CEP</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="space-y-2 flex-[2] md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rua / Logradouro</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="Rua..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Número</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.number}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="123"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Complemento</label>
                        <input
                          type="text"
                          value={shippingAddress.complement}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="Apto, Bloco..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bairro</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.neighborhood}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cidade</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</label>
                        <input
                          required
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/20 focus:border-[#CCFF00] transition-all"
                          placeholder="UF"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Forma de Pagamento</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('pix')}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            paymentMethod === 'pix' ? "border-[#CCFF00] bg-[#CCFF00] text-black" : "border-gray-800 bg-[#0B0F17] text-gray-400 hover:border-gray-700"
                          )}
                        >
                          <ShoppingBag size={24} />
                          <span className="text-xs font-bold uppercase tracking-widest">PIX</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('credit_card')}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            paymentMethod === 'credit_card' ? "border-[#CCFF00] bg-[#CCFF00] text-black" : "border-gray-800 bg-[#0B0F17] text-gray-400 hover:border-gray-700"
                          )}
                        >
                          <CreditCard size={24} />
                          <span className="text-xs font-bold uppercase tracking-widest">Cartão</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 py-4 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-4 bg-[#CCFF00] text-black font-black rounded-xl hover:bg-[#b5e000] transition-all shadow-xl shadow-[#CCFF00]/10"
                      >
                        Confirmar Pedido
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
