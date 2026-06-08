import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, ChevronRight, ShoppingBag, TrendingUp, Users, DollarSign, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const MyOrders: React.FC = () => {
  const { orders, coupons, couponUsages } = useStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'partner'>('orders');

  if (!user) return <Navigate to="/login" />;

  const userOrders = orders.filter(o => o.userId === user.id);
  const userCoupon = coupons.find(c => c.assignedUserId === user.id);
  const userUsages = userCoupon ? couponUsages.filter(u => u.couponId === userCoupon.id) : [];

  const partnerStats = useMemo(() => {
    if (!userCoupon) return null;

    const totalCommission = userUsages.reduce((acc, u) => acc + (u.commissionEarned || 0), 0);
    const totalSales = userUsages.reduce((acc, u) => acc + u.orderTotal, 0);

    // Chart data (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const dayUsages = userUsages.filter(u => {
        const usageDate = new Date(u.date);
        return usageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dateStr;
      });
      return {
        date: dateStr,
        vendas: dayUsages.length,
        comissao: dayUsages.reduce((acc, u) => acc + (u.commissionEarned || 0), 0)
      };
    }).reverse();

    return {
      totalCommission,
      totalSales,
      usageCount: userUsages.length,
      chartData: last7Days
    };
  }, [userCoupon, userUsages]);

  return (
    <div className="min-h-screen bg-[#0B0F17] py-12 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#CCFF00] rounded-2xl flex items-center justify-center">
              <Package size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">MINHA CONTA</h1>
              <p className="text-gray-400 font-medium">Gerencie seus pedidos e parcerias.</p>
            </div>
          </div>

          {userCoupon && (
            <div className="flex bg-[#131924] p-1 rounded-2xl border border-gray-800 shadow-sm">
              <button
                onClick={() => setActiveTab('orders')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === 'orders' ? "bg-[#CCFF00] text-black shadow-lg" : "text-gray-400 hover:text-white"
                )}
              >
                Meus Pedidos
              </button>
              <button
                onClick={() => setActiveTab('partner')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'partner' ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-purple-400"
                )}
              >
                <Zap size={14} /> Painel de Parceiro
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {userOrders.length === 0 ? (
                <div className="text-center py-20 bg-[#131924] rounded-[40px] border border-gray-800 shadow-sm">
                  <div className="w-20 h-20 bg-[#0B0F17] rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Você ainda não fez nenhum pedido</h3>
                  <p className="text-gray-400 mb-8">Seus mantos estão te esperando!</p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#CCFF00] text-black font-black rounded-2xl hover:bg-[#b5e000] transition-all"
                  >
                    Explorar Loja
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#131924] rounded-[32px] border border-gray-800 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 md:p-8 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4 bg-[#0B0F17]/30">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pedido</p>
                            <p className="text-sm font-black text-white">#{order.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Data</p>
                            <div className="flex items-center gap-1 text-sm font-bold text-white">
                              <Calendar size={14} className="text-gray-500" />
                              {(() => {
                                try {
                                  const date = new Date(order.date);
                                  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('pt-BR');
                                } catch (e) {
                                  return 'N/A';
                                }
                              })()}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <span className={cn(
                              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border",
                              order.status === 'pending' ? "bg-yellow-950/40 text-yellow-400 border-yellow-800/30" : 
                              order.status === 'preparing' ? "bg-blue-950/40 text-blue-400 border-blue-800/30" :
                              order.status === 'shipped' ? "bg-purple-950/40 text-purple-400 border-purple-800/30" :
                              order.status === 'delivered' ? "bg-green-950/40 text-green-400 border-green-800/30" :
                              "bg-red-950/40 text-red-400 border-red-800/30"
                            )}>
                              {order.status === 'pending' ? 'Pendente' : 
                               order.status === 'preparing' ? 'Preparando' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'delivered' ? 'Entregue' :
                               'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                          <p className="text-xl font-black text-[#CCFF00] tracking-tight">R$ {order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="space-y-6">
                          {order.items.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-4">
                              <img src={item.image || undefined} alt="" className="w-16 h-16 rounded-xl object-cover bg-[#0B0F17] border border-gray-800" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <p className="text-xs text-gray-400 font-medium">Tamanho: {item.selectedSize} • Qtd: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        {(order.trackingCode || order.adminNotes) && (
                          <div className="mt-8 pt-8 border-t border-gray-800 space-y-4">
                            {order.trackingCode && (
                              <div className="bg-[#0B0F17] p-4 rounded-2xl border border-gray-800">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Código de Rastreio</p>
                                <p className="text-sm font-mono font-bold text-[#CCFF00]">{order.trackingCode}</p>
                              </div>
                            )}
                            {order.adminNotes && (
                              <div className="bg-[#0B0F17] p-4 rounded-2xl border border-gray-800">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Mensagem da Loja</p>
                                <p className="text-sm text-gray-400 italic">"{order.adminNotes}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="partner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Partner Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#131924] p-8 rounded-[32px] border border-gray-800 shadow-sm">
                  <div className="w-12 h-12 bg-purple-950/40 rounded-2xl flex items-center justify-center mb-4">
                    <Zap size={24} className="text-purple-400" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Seu Cupom</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{userCoupon?.code}</p>
                  <p className="text-xs text-purple-400 font-bold mt-2">{userCoupon?.value}{userCoupon?.type === 'percentage' ? '%' : ' R$'} de desconto</p>
                </div>
                <div className="bg-[#131924] p-8 rounded-[32px] border border-gray-800 shadow-sm">
                  <div className="w-12 h-12 bg-green-950/40 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp size={24} className="text-green-400" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vendas Geradas</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{partnerStats?.usageCount}</p>
                  <p className="text-xs text-gray-400 font-bold mt-2">Total: R$ {partnerStats?.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-[#131924] p-8 rounded-[32px] border border-gray-800 shadow-sm">
                  <div className="w-12 h-12 bg-blue-950/40 rounded-2xl flex items-center justify-center mb-4">
                    <DollarSign size={24} className="text-blue-400" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Comissão Acumulada</p>
                  <p className="text-2xl font-black text-[#CCFF00] tracking-tighter">R$ {partnerStats?.totalCommission.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 font-bold mt-2">{userCoupon?.commissionPercentage}% por venda</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-[#131924] p-8 rounded-[40px] border border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-gray-400" size={20} />
                    <h3 className="text-lg font-black text-white tracking-tighter uppercase">Desempenho (Últimos 7 dias)</h3>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={partnerStats?.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0B0F17',
                          borderRadius: '16px', 
                          border: '1px solid #1E293B', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                          padding: '12px',
                          color: '#fff'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="vendas" 
                        name="Vendas"
                        stroke="#CCFF00" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#CCFF00', strokeWidth: 2, stroke: '#131924' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comissao" 
                        name="Comissão (R$)"
                        stroke="#A78BFA" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#A78BFA', strokeWidth: 2, stroke: '#131924' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Usages */}
              <div className="bg-[#131924] rounded-[40px] border border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-800 bg-[#0B0F17]/30">
                  <h3 className="text-lg font-black text-white tracking-tighter uppercase">Vendas Recentes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0B0F17]/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Pedido</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Comissão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {userUsages.slice().reverse().map((usage) => (
                        <tr key={usage.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                          <td className="px-8 py-4">
                            <span className="text-xs font-bold text-gray-300">
                              {new Date(usage.date).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-xs font-bold text-white">{usage.userName}</span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-xs font-bold text-gray-300">R$ {usage.orderTotal.toFixed(2)}</span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className="text-xs font-black text-[#CCFF00]">R$ {usage.commissionEarned?.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                      {userUsages.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-12 text-center text-gray-500 font-medium italic">
                            Nenhuma venda realizada com seu cupom ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
