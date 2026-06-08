import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, Banner, Review, Collection, PaymentConfig, AbandonedCart, Coupon, CouponUsage } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BANNERS } from '../constants';
import { toast } from 'sonner';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from './AuthContext';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  banners: Banner[];
  reviews: Review[];
  collections: Collection[];
  paymentConfig: PaymentConfig;
  abandonedCarts: AbandonedCart[];
  coupons: Coupon[];
  couponUsages: CouponUsage[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, quantity?: number) => void;
  removeItemFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status' | 'items' | 'total'>) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  updateBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  addReview: (review: Review) => Promise<void>;
  updateReview: (review: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  addCollection: (collection: Collection) => Promise<void>;
  updateCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  updatePaymentConfig: (config: PaymentConfig) => Promise<void>;
  reorderBanners: (banners: Banner[]) => Promise<void>;
  reorderCollections: (collections: Collection[]) => Promise<void>;
  deleteAbandonedCart: (id: string) => void;
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string) => Promise<Coupon | null>;
  importProducts: (products: Product[]) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Clear old FutCommerce keys to free up localStorage quota
try {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('fc_') || key.startsWith('futcommerce_') || key.startsWith('supabase.auth.'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => {
    localStorage.removeItem(k);
    console.log(`[CleanUp] Removed old localStorage key: ${k}`);
  });
} catch (e) {
  console.warn('LocalStorage cleanup failed:', e);
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_banners');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_collections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const defaultVal = {
      pixKey: '',
      pixQrCode: '',
      pixLegend: '',
      creditCardInfo: '',
      shippingFee: 0,
      contactPhone: '',
      contactEmail: '',
      instagramUrl: ''
    };
    try {
      const saved = localStorage.getItem('nexus_paymentConfig');
      return saved ? JSON.parse(saved) : defaultVal;
    } catch {
      return defaultVal;
    }
  });
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_coupons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_couponUsages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loadedStates, setLoadedStates] = useState({
    products: true,
    banners: true,
    collections: true,
    config: true,
    coupons: true
  });

  const loading = !Object.values(loadedStates).every(v => v);

  const { user, isAdmin } = useAuth();
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseConfigured) {
        try {
          const [
            supabaseProducts,
            supabaseBanners,
            supabaseCollections,
            supabaseConfig,
            supabaseCoupons
          ] = await Promise.all([
            supabaseService.getProducts().catch(e => { console.warn('Supabase products error:', e); return null; }),
            supabaseService.getBanners().catch(e => { console.warn('Supabase banners error:', e); return null; }),
            supabaseService.getCollections().catch(e => { console.warn('Supabase collections error:', e); return null; }),
            supabaseService.getConfig().catch(e => { console.warn('Supabase config error:', e); return null; }),
            supabaseService.getCoupons().catch(e => { console.warn('Supabase coupons error:', e); return null; })
          ]);

          // 1. Sync Products
          if (supabaseProducts && supabaseProducts.length > 0) {
            setProducts(supabaseProducts.map(p => ({ ...p, active: p.active ?? true, stock: p.stock ?? 0 })));
          } else if (supabaseProducts && supabaseProducts.length === 0) {
            try {
              const saved = localStorage.getItem('nexus_products');
              if (saved) {
                const localItems = JSON.parse(saved) as Product[];
                if (localItems && localItems.length > 0) {
                  console.log('[Sync] Migrating products to Supabase:', localItems);
                  await Promise.all(localItems.map(p => supabaseService.upsertProduct(p)));
                  const refreshed = await supabaseService.getProducts();
                  setProducts(refreshed.map(p => ({ ...p, active: p.active ?? true, stock: p.stock ?? 0 })));
                }
              }
            } catch (err) {
              console.error('Failed to sync products to Supabase:', err);
            }
          }

          // 2. Sync Banners
          if (supabaseBanners && supabaseBanners.length > 0) {
            setBanners(supabaseBanners.map(b => ({ ...b, active: b.active ?? true })));
          } else if (supabaseBanners && supabaseBanners.length === 0) {
            try {
              const saved = localStorage.getItem('nexus_banners');
              if (saved) {
                const localItems = JSON.parse(saved) as Banner[];
                if (localItems && localItems.length > 0) {
                  console.log('[Sync] Migrating banners to Supabase:', localItems);
                  await Promise.all(localItems.map(b => supabaseService.upsertBanner(b)));
                  const refreshed = await supabaseService.getBanners();
                  setBanners(refreshed.map(b => ({ ...b, active: b.active ?? true })));
                }
              }
            } catch (err) {
              console.error('Failed to sync banners to Supabase:', err);
            }
          }

          // 3. Sync Collections
          if (supabaseCollections && supabaseCollections.length > 0) {
            setCollections(supabaseCollections.map(c => ({ ...c, active: c.active ?? true })));
          } else if (supabaseCollections && supabaseCollections.length === 0) {
            try {
              const saved = localStorage.getItem('nexus_collections');
              if (saved) {
                const localItems = JSON.parse(saved) as Collection[];
                if (localItems && localItems.length > 0) {
                  console.log('[Sync] Migrating collections to Supabase:', localItems);
                  await Promise.all(localItems.map(c => supabaseService.upsertCollection(c)));
                  const refreshed = await supabaseService.getCollections();
                  setCollections(refreshed.map(c => ({ ...c, active: c.active ?? true })));
                }
              }
            } catch (err) {
              console.error('Failed to sync collections to Supabase:', err);
            }
          }

          // 4. Sync Config
          if (supabaseConfig) {
            setPaymentConfig(supabaseConfig);
          } else {
            try {
              const saved = localStorage.getItem('nexus_paymentConfig');
              if (saved) {
                const localConfig = JSON.parse(saved) as PaymentConfig;
                if (localConfig && (localConfig.pixKey || localConfig.contactPhone || localConfig.contactEmail)) {
                  console.log('[Sync] Migrating payment config to Supabase:', localConfig);
                  await supabaseService.updateConfig(localConfig);
                  const refreshed = await supabaseService.getConfig();
                  if (refreshed) {
                    setPaymentConfig(refreshed);
                  }
                }
              }
            } catch (err) {
              console.error('Failed to sync config to Supabase:', err);
            }
          }

          // 5. Sync Coupons
          if (supabaseCoupons && supabaseCoupons.length > 0) {
            setCoupons(supabaseCoupons.map(c => ({ ...c, active: c.active ?? true, usageCount: c.usageCount ?? 0 })));
          } else if (supabaseCoupons && supabaseCoupons.length === 0) {
            try {
              const saved = localStorage.getItem('nexus_coupons');
              if (saved) {
                const localItems = JSON.parse(saved) as Coupon[];
                if (localItems && localItems.length > 0) {
                  console.log('[Sync] Migrating coupons to Supabase:', localItems);
                  await Promise.all(localItems.map(c => supabaseService.upsertCoupon(c)));
                  const refreshed = await supabaseService.getCoupons();
                  setCoupons(refreshed.map(c => ({ ...c, active: c.active ?? true, usageCount: c.usageCount ?? 0 })));
                }
              }
            } catch (err) {
              console.error('Failed to sync coupons to Supabase:', err);
            }
          }
        } catch (error) {
          console.warn('Error loading from Supabase:', error);
        }
      }
    };

    loadData();
  }, [isSupabaseConfigured]);

  // Auth-dependent listeners
  useEffect(() => {
    const loadAuthData = async () => {
      if (!user) {
        setOrders([]);
        if (isSupabaseConfigured) {
          try {
            const items = await supabaseService.getReviews(undefined, true);
            setReviews(items);
          } catch (e) {
            console.error('Supabase reviews error:', e);
          }
        }
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const [supabaseOrders, supabaseReviews, supabaseUsages] = await Promise.all([
            supabaseService.getOrders(isAdmin ? undefined : user.id).catch(() => []),
            supabaseService.getReviews(undefined, !isAdmin).catch(() => []),
            isAdmin ? supabaseService.getCouponUsages().catch(() => []) : Promise.resolve([])
          ]);
          setOrders(supabaseOrders);
          setReviews(supabaseReviews);
          setCouponUsages(supabaseUsages);
        } catch (e) {
          console.error('Error loading auth data from Supabase:', e);
        }
      }
    };

    loadAuthData();
  }, [user, isAdmin, isSupabaseConfigured]);


  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nexus_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexus_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nexus_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('nexus_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('nexus_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('nexus_paymentConfig', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  useEffect(() => {
    localStorage.setItem('nexus_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('nexus_couponUsages', JSON.stringify(couponUsages));
  }, [couponUsages]);

  const addProduct = async (product: Product) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertProduct(product);
        const updated = await supabaseService.getProducts();
        setProducts(updated);
        savedToCloud = true;
        toast.success('Produto adicionado com sucesso!');
      } catch (error) {
        console.warn('Supabase error adding product, falling back to local:', error);
      }
    }
    if (!savedToCloud) {
      setProducts(prev => {
        if (prev.some(p => p.id === product.id)) {
          return prev.map(p => p.id === product.id ? product : p);
        }
        return [...prev, product];
      });
      toast.success('Produto adicionado localmente (modo offline)!');
    }
  };

  const updateProduct = async (product: Product) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertProduct(product);
        const updated = await supabaseService.getProducts();
        setProducts(updated);
        savedToCloud = true;
        toast.success('Produto atualizado com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating product, falling back to local:', error);
      }
    }
    if (!savedToCloud) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      toast.success('Produto atualizado localmente!');
    }
  };

  const deleteProduct = async (id: string) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.deleteProduct(id);
        savedToCloud = true;
        toast.success('Produto excluído com sucesso!');
      } catch (error) {
        console.warn('Supabase error deleting product, falling back to local:', error);
      }
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    if (!savedToCloud) {
      toast.success('Produto excluído localmente!');
    }
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<Product>) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        const updatesPromises = ids.map(async id => {
          const product = products.find(p => p.id === id);
          if (product) {
            const updated = { ...product, ...updates };
            return supabaseService.upsertProduct(updated);
          }
        });
        await Promise.all(updatesPromises);
        const updated = await supabaseService.getProducts();
        setProducts(updated);
        savedToCloud = true;
        toast.success('Produtos atualizados em massa!');
      } catch (error) {
        console.warn('Supabase error bulk updating, falling back to local:', error);
      }
    }
    if (!savedToCloud) {
      setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
      toast.success('Produtos atualizados localmente!');
    }
  };

  const bulkDeleteProducts = async (ids: string[]) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await Promise.all(ids.map(id => supabaseService.deleteProduct(id)));
        savedToCloud = true;
        toast.success('Produtos excluídos em massa!');
      } catch (error) {
        console.warn('Supabase error bulk deleting, falling back to local:', error);
      }
    }
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    if (!savedToCloud) {
      toast.success('Produtos excluídos localmente!');
    }
  };

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    const sizeStock = product.sizeStock?.[size] ?? 0;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      const currentQuantity = existing ? existing.quantity : 0;
      if (currentQuantity + quantity > sizeStock) {
        toast.error(`Desculpe, só temos ${sizeStock} unidades do tamanho ${size} em estoque.`);
        return prev;
      }
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId && item.selectedSize === size);
      if (!existing) return prev;

      if (existing.quantity <= quantity) {
        return prev.filter(item => !(item.id === productId && item.selectedSize === size));
      }

      return prev.map(item =>
        (item.id === productId && item.selectedSize === size)
          ? { ...item, quantity: item.quantity - quantity }
          : item
      );
    });
  };

  const removeItemFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status' | 'items' | 'total'>) => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    let discount = 0;
    let finalTotal = subtotal + paymentConfig.shippingFee;

    if (orderData.couponCode) {
      const coupon = coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase() && c.active);
      if (coupon) {
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        finalTotal = Math.max(0, subtotal - discount + paymentConfig.shippingFee);
      }
    }

    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const updatedProducts = products.map(p => {
      const cartItemsForProduct = cart.filter(item => item.id === p.id);
      if (cartItemsForProduct.length > 0) {
        const newSizeStock = { ...(p.sizeStock || {}) };
        for (const item of cartItemsForProduct) {
          if (newSizeStock[item.selectedSize] !== undefined) {
            newSizeStock[item.selectedSize] = Math.max(0, newSizeStock[item.selectedSize] - item.quantity);
          }
        }
        const newTotalStock = Object.values(newSizeStock).reduce((acc: number, val: any) => acc + (val as number), 0);
        return { ...p, sizeStock: newSizeStock, stock: newTotalStock };
      }
      return p;
    });

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      items: [...cart],
      total: finalTotal,
      discount,
      status: 'pending',
      date: new Date().toISOString(),
    };

    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        for (const item of cart) {
          const p = updatedProducts.find(prod => prod.id === item.id);
          if (p) {
            await supabaseService.getClient().from('products').upsert(p);
          }
        }
        
        await supabaseService.createOrder(newOrder);

        if (orderData.couponCode) {
          const coupon = coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase());
          if (coupon) {
            let commissionEarned = 0;
            if (coupon.isReferral) {
              if (coupon.indicatorRewardType === 'percentage') {
                commissionEarned = (subtotal * (coupon.indicatorRewardPerUse || 0)) / 100;
              } else {
                commissionEarned = coupon.indicatorRewardPerUse || 0;
              }
            }

            const usageId = Math.random().toString(36).substr(2, 9);
            const usage: CouponUsage = {
              id: usageId,
              couponId: coupon.id,
              couponCode: coupon.code,
              userId: orderData.userId,
              userName: orderData.customerName,
              userEmail: orderData.customerEmail,
              orderId: orderId,
              orderTotal: finalTotal,
              discountApplied: discount,
              date: new Date().toISOString(),
              commissionEarned
            };
            const updatedCoupon = {
              ...coupon,
              usageCount: (coupon.usageCount || 0) + 1
            };
            
            await supabaseService.createCouponUsage(usage);
            await supabaseService.upsertCoupon(updatedCoupon);
            setCouponUsages(prev => [usage, ...prev]);
            setCoupons(prev => prev.map(c => c.id === coupon.id ? updatedCoupon : c));
          }
        }
        
        savedToCloud = true;
        setProducts(updatedProducts);
        setOrders(prev => [newOrder, ...prev]);
        toast.success('Pedido finalizado com sucesso!');
      } catch (err) {
        console.warn('Supabase error placing order, falling back to local:', err);
      }
    }

    if (!savedToCloud) {
      setProducts(updatedProducts);
      setOrders(prev => [newOrder, ...prev]);
      
      if (orderData.couponCode) {
        const coupon = coupons.find(c => c.code.toUpperCase() === orderData.couponCode?.toUpperCase());
        if (coupon) {
          const updatedCoupon = {
            ...coupon,
            usageCount: (coupon.usageCount || 0) + 1
          };
          setCoupons(prev => prev.map(c => c.id === coupon.id ? updatedCoupon : c));
        }
      }
      toast.success('Pedido finalizado localmente!');
    }

    clearCart();
  };

  // Import products batch
  const importProducts = async (newProducts: Product[]) => {
    // Merge with existing products, avoiding duplicates by id
    setProducts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filtered = newProducts.filter(p => !existingIds.has(p.id));
      const merged = [...prev, ...filtered];
      // Persist to localStorage
      localStorage.setItem('nexus_products', JSON.stringify(merged));
      return merged;
    });
    toast.success('Produtos importados com sucesso!');
  };

  const addCoupon = async (coupon: Coupon) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertCoupon(coupon);
        savedToCloud = true;
        toast.success('Cupom adicionado com sucesso!');
      } catch (error) {
        console.warn('Supabase error adding coupon, falling back to local:', error);
      }
    }
    setCoupons(prev => [...prev, coupon]);
    if (!savedToCloud) {
      toast.success('Cupom adicionado localmente!');
    }
  };

  const updateCoupon = async (coupon: Coupon) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertCoupon(coupon);
        savedToCloud = true;
        toast.success('Cupom atualizado com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating coupon, falling back to local:', error);
      }
    }
    setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
    if (!savedToCloud) {
      toast.success('Cupom atualizado localmente!');
    }
  };

  const deleteCoupon = async (id: string) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.deleteCoupon(id);
        savedToCloud = true;
        toast.success('Cupom deletado com sucesso!');
      } catch (error) {
        console.warn('Supabase error deleting coupon, falling back to local:', error);
      }
    }
    setCoupons(prev => prev.filter(c => c.id !== id));
    if (!savedToCloud) {
      toast.success('Cupom deletado localmente!');
    }
  };

  const validateCoupon = async (code: string): Promise<Coupon | null> => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      toast.error('Cupom inválido.');
      return null;
    }
    if (!coupon.active) {
      toast.error('Cupom inativo.');
      return null;
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      toast.error(`Valor mínimo para este cupom: R$ ${coupon.minOrderValue.toFixed(2)}`);
      return null;
    }
    if (coupon.maxOrderValue && subtotal > coupon.maxOrderValue) {
      toast.error(`Valor máximo para este cupom: R$ ${coupon.maxOrderValue.toFixed(2)}`);
      return null;
    }
    if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
      toast.error(`Quantidade mínima de itens: ${coupon.minQuantity}`);
      return null;
    }
    if (coupon.maxQuantity && totalQuantity > coupon.maxQuantity) {
      toast.error(`Quantidade máxima de itens: ${coupon.maxQuantity}`);
      return null;
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      toast.error('Cupom esgotado.');
      return null;
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      toast.error('Cupom expirado.');
      return null;
    }

    toast.success('Cupom aplicado com sucesso!');
    return coupon;
  };

  const updateOrder = async (order: Order) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateOrder(order);
        savedToCloud = true;
        toast.success('Pedido atualizado com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating order, falling back to local:', error);
      }
    }
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    if (!savedToCloud) {
      toast.success('Pedido atualizado localmente!');
    }
  };

  const addBanner = async (banner: Banner) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertBanner(banner);
        savedToCloud = true;
        toast.success('Banner adicionado com sucesso!');
      } catch (error) {
        console.warn('Supabase error adding banner, falling back to local:', error);
      }
    }
    setBanners(prev => [...prev, banner]);
    if (!savedToCloud) {
      toast.success('Banner adicionado localmente!');
    }
  };

  const updateBanner = async (banner: Banner) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertBanner(banner);
        savedToCloud = true;
        toast.success('Banner atualizado com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating banner, falling back to local:', error);
      }
    }
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
    if (!savedToCloud) {
      toast.success('Banner atualizado localmente!');
    }
  };

  const deleteBanner = async (id: string) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.deleteBanner(id);
        savedToCloud = true;
        toast.success('Banner deletado com sucesso!');
      } catch (error) {
        console.warn('Supabase error deleting banner, falling back to local:', error);
      }
    }
    setBanners(prev => prev.filter(b => b.id !== id));
    if (!savedToCloud) {
      toast.success('Banner deletado localmente!');
    }
  };

  const addReview = async (review: Review) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertReview(review);
        savedToCloud = true;
        toast.success('Avaliação enviada com sucesso!');
      } catch (error) {
        console.warn('Supabase error adding review, falling back to local:', error);
      }
    }
    setReviews(prev => [...prev, review]);
    if (!savedToCloud) {
      toast.success('Avaliação enviada localmente!');
    }
  };

  const updateReview = async (review: Review) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertReview(review);
        savedToCloud = true;
        toast.success('Avaliação atualizada com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating review, falling back to local:', error);
      }
    }
    setReviews(prev => prev.map(r => r.id === review.id ? review : r));
    if (!savedToCloud) {
      toast.success('Avaliação atualizada localmente!');
    }
  };

  const deleteReview = async (id: string) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.deleteReview(id);
        savedToCloud = true;
        toast.success('Avaliação deletada com sucesso!');
      } catch (error) {
        console.warn('Supabase error deleting review, falling back to local:', error);
      }
    }
    setReviews(prev => prev.filter(r => r.id !== id));
    if (!savedToCloud) {
      toast.success('Avaliação deletada localmente!');
    }
  };

  const addCollection = async (collection: Collection) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertCollection(collection);
        savedToCloud = true;
        toast.success('Coleção adicionada com sucesso!');
      } catch (error) {
        console.warn('Supabase error adding collection, falling back to local:', error);
      }
    }
    setCollections(prev => [...prev, collection]);
    if (!savedToCloud) {
      toast.success('Coleção adicionada localmente!');
    }
  };

  const updateCollection = async (collection: Collection) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.upsertCollection(collection);
        savedToCloud = true;
        toast.success('Coleção atualizada com sucesso!');
      } catch (error) {
        console.warn('Supabase error updating collection, falling back to local:', error);
      }
    }
    setCollections(prev => prev.map(c => c.id === collection.id ? collection : c));
    if (!savedToCloud) {
      toast.success('Coleção atualizada localmente!');
    }
  };

  const deleteCollection = async (id: string) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.deleteCollection(id);
        savedToCloud = true;
        toast.success('Coleção excluída com sucesso!');
      } catch (error) {
        console.warn('Supabase error deleting collection, falling back to local:', error);
      }
    }
    setCollections(prev => prev.filter(c => c.id !== id));
    if (!savedToCloud) {
      toast.success('Coleção excluída localmente!');
    }
  };

  const updatePaymentConfig = async (config: PaymentConfig) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateConfig(config);
        savedToCloud = true;
        toast.success('Configurações de pagamento atualizadas!');
      } catch (error) {
        console.warn('Supabase error updating payment config, falling back to local:', error);
      }
    }
    setPaymentConfig(config);
    if (!savedToCloud) {
      toast.success('Configurações de pagamento salvas localmente!');
    }
  };

  const reorderBanners = async (newBanners: Banner[]) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await Promise.all(newBanners.map(b => supabaseService.upsertBanner(b)));
        savedToCloud = true;
        toast.success('Banners reordenados com sucesso!');
      } catch (error) {
        console.warn('Supabase error reordering banners, falling back to local:', error);
      }
    }
    setBanners(newBanners);
    if (!savedToCloud) {
      toast.success('Banners reordenados localmente!');
    }
  };

  const reorderCollections = async (newCollections: Collection[]) => {
    let savedToCloud = false;
    if (isSupabaseConfigured) {
      try {
        await Promise.all(newCollections.map(c => supabaseService.upsertCollection(c)));
        savedToCloud = true;
        toast.success('Coleções reordenadas com sucesso!');
      } catch (error) {
        console.warn('Supabase error reordering collections, falling back to local:', error);
      }
    }
    setCollections(newCollections);
    if (!savedToCloud) {
      toast.success('Coleções reordenadas localmente!');
    }
  };

  const deleteAbandonedCart = (id: string) => {
    setAbandonedCarts(prev => prev.filter(ac => ac.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      products, cart, orders, banners, reviews, collections, paymentConfig, abandonedCarts,
      coupons, couponUsages, loading,
      addProduct, updateProduct, deleteProduct, bulkUpdateProducts, bulkDeleteProducts,
      addToCart, removeFromCart, removeItemFromCart, clearCart, placeOrder, updateOrder,
      addBanner, updateBanner, deleteBanner,
      addReview, updateReview, deleteReview,
      addCollection, updateCollection, deleteCollection,
      updatePaymentConfig,
      reorderBanners, reorderCollections,
      deleteAbandonedCart,
      addCoupon, updateCoupon, deleteCoupon, validateCoupon,
      importProducts
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
