import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Edit2, Trash2, Package, ShoppingBag, TrendingUp, Users, X, Image as ImageIcon, Save, Layout, CheckCircle2, AlertCircle, BarChart3, PieChart as PieChartIcon, DollarSign, Filter, Search, ChevronRight, Upload, ChevronUp, ChevronDown, Copy, ArrowLeft, Star, FolderPlus, Zap, Database, ArrowRight, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, compressImage } from '../lib/utils';
import { Product, Banner, Order, User, Review, Collection, PaymentConfig, Coupon, CouponUsage } from '../types';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell, Pie } from 'recharts';

import { toast } from 'sonner';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { importProductsFromUrl } from '../services/productImportService';

type Tab = 'dashboard' | 'products' | 'orders' | 'manual-orders' | 'abandoned-carts' | 'banners' | 'users' | 'collections' | 'reviews' | 'payment' | 'new-arrivals' | 'coupons' | 'marketing' | 'import';

const SIDEBAR_GROUPS = [
  { title: 'Gestão', items: [
    { id: 'orders', name: 'Vendas', icon: ShoppingBag, subItems: [
      { id: 'orders', name: 'Lista de vendas' },
      { id: 'manual-orders', name: 'Pedidos manuais' },
      { id: 'abandoned-carts', name: 'Carrinhos abandonados' }
    ]},
    { id: 'products', name: 'Produtos', icon: Package },
    { id: 'new-arrivals', name: 'Lançamentos', icon: Zap },
    { id: 'coupons', name: 'Cupons', icon: Zap },
    { id: 'users', name: 'Clientes', icon: Users },
    { id: 'collections', name: 'Categorias', icon: Filter },
    { id: 'import', name: 'Importar Produtos', icon: Upload }, // new import tab
  ]},
  { title: 'Personalização', items: [
    { id: 'banners', name: 'Banners', icon: Layout },
    { id: 'marketing', name: 'Marketing', icon: Zap },
    { id: 'reviews', name: 'Avaliações', icon: CheckCircle2 },
  ]},
  { title: 'Configurações', items: [
    { id: 'payment', name: 'Pagamento', icon: DollarSign },
  ]}
];

interface CollectionItemProps {
  collection: Collection;
  allCollections: Collection[];
  depth?: number;
  onEdit: (c: Collection) => void;
  onDelete: (id: string) => void;
  onDuplicate: (c: Collection) => void;
  onAddSubCollection: (parentId: string) => void;
  onAddProduct: (categoryName: string) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({ 
  collection, 
  allCollections, 
  depth = 0, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onAddSubCollection,
  onAddProduct
}) => {
  const { products } = useStore();
  const children = allCollections.filter(c => c.parentId === collection.id);
  const collectionProducts = products.filter(p => p.category === collection.name);
  const hasChildren = children.length > 0 || collectionProducts.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors group",
          depth > 0 && "pl-12"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="text-gray-300 cursor-grab active:cursor-grabbing">
            <Layout size={16} />
          </div>
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className="flex items-center gap-3">
            {collection.image && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                <img src={collection.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <span className={cn("font-bold text-sm", depth === 0 ? "text-black" : "text-gray-600")}>
              {collection.name}
            </span>
            <span className="text-[10px] font-bold text-gray-400">({collectionProducts.length} produtos)</span>
          </div>
          {!collection.active && (
            <span className="text-[8px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Inativo</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddProduct(collection.name)}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            title="Adicionar Produto nesta Categoria"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onAddSubCollection(collection.id)}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            title="Adicionar Subcategoria"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={() => onDuplicate(collection)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            title="Duplicar"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onEdit(collection)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                onDelete(collection.id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="bg-gray-50/30">
          {/* Sub-collections */}
          {children.map(child => (
            <CollectionItem 
              key={child.id} 
              collection={child} 
              allCollections={allCollections} 
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onAddSubCollection={onAddSubCollection}
              onAddProduct={onAddProduct}
            />
          ))}
          
          {/* Products in this collection */}
          {collectionProducts.map(product => (
            <div 
              key={product.id}
              className={cn(
                "flex items-center justify-between p-3 pl-20 bg-white/50 border-b border-gray-50 hover:bg-gray-50 transition-colors group/prod",
                depth > 0 && "pl-28"
              )}
            >
              <div className="flex items-center gap-3">
                <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                <div>
                  <p className="text-xs font-bold text-gray-700">{product.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">SKU: {product.sku || 'N/A'} • R$ {product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover/prod:opacity-100 transition-opacity pr-4">
                <span className={cn(
                  "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                  product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



export const AdminDashboard: React.FC = () => {
  const { 
    products, orders, banners, reviews, collections, paymentConfig, abandonedCarts,
    addProduct, updateProduct, deleteProduct, 
    addBanner, updateBanner, deleteBanner, 
    updateOrder,
    addCollection, updateCollection, deleteCollection,
    addReview, updateReview, deleteReview,
    updatePaymentConfig,
    reorderBanners, reorderCollections,
    deleteAbandonedCart,
    bulkUpdateProducts, bulkDeleteProducts,
    coupons, couponUsages, addCoupon, updateCoupon, deleteCoupon,
    importProducts
  } = useStore();
  const { users, deleteUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [newArrivalsSearch, setNewArrivalsSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // new state
  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isBulkCollectionModalOpen, setIsBulkCollectionModalOpen] = useState(false);
  const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false);
  const [bulkPriceValue, setBulkPriceValue] = useState(0);
  const [bulkPriceType, setBulkPriceType] = useState<'fixed' | 'percentage' | 'add'>('fixed');
  const [bulkCollectionId, setBulkCollectionId] = useState('');
  const [bulkStockValue, setBulkStockValue] = useState(0);
  
  const [newSize, setNewSize] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedReviewProductId, setSelectedReviewProductId] = useState<string | null>(null);
  const [reviewSearch, setReviewSearch] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  
  const [orderFilter, setOrderFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const [paymentFormData, setPaymentFormData] = useState<PaymentConfig>(paymentConfig);

  useEffect(() => {
    setPaymentFormData(paymentConfig);
  }, [paymentConfig]);

  const [marketingForm, setMarketingForm] = useState<any>({
    popupActive: true,
    popupTitle: '',
    popupMessage: '',
    popupCoupon: '',
    toastActive: true,
    toastBuyers: '',
    toastLocations: '',
    toastInterval: 20
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_marketing_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMarketingForm({
          ...parsed,
          toastBuyers: Array.isArray(parsed.toastBuyers) ? parsed.toastBuyers.join(', ') : parsed.toastBuyers || '',
          toastLocations: Array.isArray(parsed.toastLocations) ? parsed.toastLocations.join(', ') : parsed.toastLocations || ''
        });
      } else {
        setMarketingForm({
          popupActive: true,
          popupTitle: '🔥 BEM-VINDO À NEXUS STORE!',
          popupMessage: 'Cadastre seu e-mail e ganhe 10% DE DESCONTO na sua primeira compra com o cupom especial abaixo!',
          popupCoupon: 'NEXUS10',
          toastActive: true,
          toastBuyers: 'Thiago, Amanda, Lucas, Carla, Felipe, Juliana, Rafael, Bruna, Matheus, Fernanda, Diego, Isabela, Victor, Larissa, Gabriel, Camila',
          toastLocations: 'São Paulo/SP, Rio de Janeiro/RJ, Belo Horizonte/MG, Porto Alegre/RS, Curitiba/PR, Recife/PE, Salvador/BA',
          toastInterval: 20
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeTab]);

  const [collectionFormData, setCollectionFormData] = useState<Partial<Collection>>({
    name: '',
    description: '',
    image: '',
    active: true,
    parentId: undefined,
    isGuide: false
  });

  const [reviewFormData, setReviewFormData] = useState<Partial<Review>>({
    userName: '',
    rating: 5,
    comment: '',
    productId: '',
    productName: '',
    images: [],
    date: new Date().toISOString()
  });

  const [bannerFormData, setBannerFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'Ver Coleção',
    active: true
  });

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    team: '',
    league: '',
    price: 0,
    originalPrice: 0,
    costPrice: 0,
    image: '',
    images: [],
    description: '',
    category: 'Home',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 0,
    sizeStock: { 'P': 0, 'M': 0, 'G': 0, 'GG': 0 }
  });

  const [couponFormData, setCouponFormData] = useState<Partial<Coupon>>({
    code: '',
    type: 'percentage',
    value: 0,
    active: true,
    usageCount: 0,
    isReferral: false,
    indicatorName: '',
    indicatorRewardType: 'fixed',
    indicatorRewardPerUse: 0,
    assignedUserId: '',
    commissionPercentage: 0
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        // Re-introducing compression to fix the 1MB Firestore limit error
        const compressed = await compressImage(result);
        callback(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>, currentImages: string[], callback: (urls: string[]) => void) => {
    const files = Array.from(e.target.files || []);
    const newImages: string[] = [...currentImages];
    let processed = 0;

    if (files.length === 0) return;

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        // Re-introducing compression to fix the 1MB Firestore limit error
        const compressed = await compressImage(result);
        newImages.push(compressed);
        processed++;
        if (processed === files.length) {
          callback(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('pt-BR', options);
    } catch (e) {
      return 'N/A';
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalCost = orders.reduce((acc, o) => {
    return acc + (o.items || []).reduce((itemAcc, item) => itemAcc + (item.costPrice || 0) * (item.quantity || 0), 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;

  const stats = [
    { name: 'Faturamento', value: `R$ ${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Lucro Estimado', value: `R$ ${totalProfit.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Pedidos', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Clientes', value: users.length, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const chartData = orders.reduce((acc: any[], order) => {
    const date = formatDate(order.date, { day: '2-digit', month: '2-digit' });
    if (date === 'N/A') return acc;
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.vendas += order.total;
      existing.pedidos += 1;
    } else {
      acc.push({ date, vendas: order.total, pedidos: 1 });
    }
    return acc;
  }, []).slice(-7);

  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find(d => d.name === product.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#E5E7EB'];

  const handleOpenModal = (product?: Product, initialCategory?: string) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        sizeStock: product.sizeStock || product.sizes.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        team: '',
        league: '',
        price: 0,
        image: '',
        images: [],
        description: '',
        category: initialCategory || collections[0]?.name || 'Home',
        sizes: ['P', 'M', 'G', 'GG'],
        stock: 0,
        costPrice: 0,
        active: true,
        sizeStock: { 'P': 0, 'M': 0, 'G': 0, 'GG': 0 }
      });
    }
    setIsModalOpen(true);
  };

  const toggleNewArrival = (product: Product) => {
    updateProduct({ ...product, isNewArrival: !product.isNewArrival });
    toast.success(`Produto ${!product.isNewArrival ? 'adicionado aos' : 'removido dos'} lançamentos!`);
  };

  const handleAddSize = () => {
    if (!newSize) return;
    const size = newSize.toUpperCase();
    if (formData.sizes?.includes(size)) {
      toast.error('Este tamanho já existe.');
      return;
    }
    setFormData({
      ...formData,
      sizes: [...(formData.sizes || []), size],
      sizeStock: {
        ...(formData.sizeStock || {}),
        [size]: 0
      }
    });
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const newSizes = formData.sizes?.filter(s => s !== sizeToRemove) || [];
    const newSizeStock = { ...(formData.sizeStock || {}) };
    delete newSizeStock[sizeToRemove];
    
    setFormData({
      ...formData,
      sizes: newSizes,
      sizeStock: newSizeStock
    });
  };

  const handleMoveSize = (index: number, direction: 'up' | 'down') => {
    const newSizes = [...(formData.sizes || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSizes.length) {
      [newSizes[index], newSizes[targetIndex]] = [newSizes[targetIndex], newSizes[index]];
      setFormData({ ...formData, sizes: newSizes });
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedProductIds.length} produtos?`)) {
      try {
        await bulkDeleteProducts(selectedProductIds);
        setSelectedProductIds([]);
        toast.success('Produtos excluídos com sucesso.');
      } catch (error) {
        toast.error('Erro ao excluir produtos.');
      }
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (bulkPriceValue <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    try {
      const updates = selectedProductIds.map(id => {
        const product = products.find(p => p.id === id);
        if (product) {
          let newPrice = product.price;
          if (bulkPriceType === 'fixed') {
            newPrice = bulkPriceValue;
          } else if (bulkPriceType === 'percentage') {
            newPrice = product.price * (1 + bulkPriceValue / 100);
          } else {
            newPrice = product.price + bulkPriceValue;
          }
          return updateProduct({ ...product, price: newPrice });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      setIsBulkPriceModalOpen(false);
      setSelectedProductIds([]);
      toast.success('Preços atualizados com sucesso.');
    } catch (error) {
      toast.error('Erro ao atualizar preços.');
    }
  };

  const handleBulkCollectionUpdate = async () => {
    if (!bulkCollectionId) {
      toast.error('Selecione uma categoria.');
      return;
    }

    const collection = collections.find(c => c.id === bulkCollectionId);
    if (!collection) return;

    try {
      await bulkUpdateProducts(selectedProductIds, { category: collection.name });
      setIsBulkCollectionModalOpen(false);
      setSelectedProductIds([]);
      setBulkCollectionId('');
      toast.success(`Produtos movidos para ${collection.name} com sucesso.`);
    } catch (error) {
      toast.error('Erro ao mover produtos.');
    }
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    try {
      await bulkUpdateProducts(selectedProductIds, { active });
      setSelectedProductIds([]);
      toast.success(`Status dos produtos atualizado para ${active ? 'Ativo' : 'Inativo'}.`);
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const handleBulkStockUpdate = async () => {
    if (bulkStockValue < 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    try {
      const updates = selectedProductIds.map(id => {
        const product = products.find(p => p.id === id);
        if (product) {
          const newSizeStock = { ...(product.sizeStock || {}) };
          Object.keys(newSizeStock).forEach(size => {
            newSizeStock[size] = bulkStockValue;
          });
          
          return updateProduct({
            ...product,
            sizeStock: newSizeStock,
            stock: bulkStockValue * Object.keys(newSizeStock).length
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      setIsBulkStockModalOpen(false);
      setSelectedProductIds([]);
      setBulkStockValue(0);
      toast.success('Estoques atualizados com sucesso.');
    } catch (error) {
      toast.error('Erro ao atualizar estoques.');
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

const handleOpenBannerModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerFormData(banner);
    } else {
      setEditingBanner(null);
      setBannerFormData({
        title: '',
        subtitle: '',
        image: '',
        buttonText: 'Ver Coleção',
        active: true
      });
    }
    setIsBannerModalOpen(true);
  };

  const handleOpenCollectionModal = (collection?: Collection, parentId?: string) => {
    if (collection) {
      setEditingCollection(collection);
      setCollectionFormData(collection);
    } else {
      setEditingCollection(null);
      setCollectionFormData({
        name: '',
        description: '',
        image: '',
        active: true,
        parentId: parentId || undefined
      });
    }
    setIsCollectionModalOpen(true);
  };

  const handleOpenReviewModal = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setReviewFormData(review);
    } else {
      const selectedProduct = selectedReviewProductId ? products.find(p => p.id === selectedReviewProductId) : null;
      setEditingReview(null);
      setReviewFormData({
        userName: '',
        rating: 5,
        comment: '',
        productId: selectedReviewProductId || '',
        productName: selectedProduct?.name || '',
        images: [],
        date: new Date().toISOString(),
        approved: true
      });
    }
    setIsReviewModalOpen(true);
  };

  const handleOpenCouponModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponFormData(coupon);
    } else {
      setEditingCoupon(null);
      setCouponFormData({
        code: '',
        type: 'percentage',
        value: 0,
        active: true,
        usageCount: 0,
        isReferral: false,
        indicatorName: '',
        indicatorRewardPerUse: 0
      });
    }
    setIsCouponModalOpen(true);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionData = {
      ...collectionFormData,
      id: editingCollection?.id || Math.random().toString(36).substr(2, 9),
    } as Collection;

    // Check document size (approximate)
    const docSize = JSON.stringify(collectionData).length;
    if (docSize > 1000000) { // 1MB limit
      toast.error('A categoria está muito pesada devido à imagem. Tente usar uma imagem menor.');
      return;
    }

    try {
      if (editingCollection) {
        await updateCollection(collectionData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await addCollection(collectionData);
        toast.success('Categoria adicionada com sucesso!');
      }
      setIsCollectionModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar categoria.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData = {
      ...reviewFormData,
      id: editingReview?.id || Math.random().toString(36).substr(2, 9),
    } as Review;

    // Check document size (approximate)
    const docSize = JSON.stringify(reviewData).length;
    if (docSize > 1000000) { // 1MB limit
      toast.error('A avaliação está muito pesada devido às imagens. Tente remover algumas fotos ou usar imagens menores.');
      return;
    }

    try {
      if (editingReview) {
        await updateReview(reviewData);
        toast.success('Avaliação atualizada!');
      } else {
        await addReview(reviewData);
        toast.success('Avaliação adicionada!');
      }
      setIsReviewModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar avaliação.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total stock from sizeStock
    const totalStock = Object.values(formData.sizeStock || {}).reduce((acc, val) => acc + val, 0);
    
    const productData = {
      ...formData,
      stock: totalStock,
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
    } as Product;

    // Re-introducing size check to prevent Firestore 1MB limit error
    const docSize = JSON.stringify(productData).length;
    if (docSize > 1000000) { // 1MB limit
      toast.error('O produto ainda está muito pesado para o banco de dados. Tente remover algumas fotos ou reduzir a qualidade das imagens originais.');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addProduct(productData);
        toast.success('Produto adicionado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerData = {
      ...bannerFormData,
      id: editingBanner?.id || Math.random().toString(36).substr(2, 9),
    } as Banner;

    try {
      if (editingBanner) {
        await updateBanner(bannerData);
        toast.success('Banner atualizado!');
      } else {
        await addBanner(bannerData);
        toast.success('Banner adicionado!');
      }
      setIsBannerModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar banner.');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponData = {
      ...couponFormData,
      id: editingCoupon?.id || Math.random().toString(36).substr(2, 9),
      code: couponFormData.code?.toUpperCase()
    } as Coupon;

    try {
      if (editingCoupon) {
        await updateCoupon(couponData);
        toast.success('Cupom atualizado!');
      } else {
        await addCoupon(couponData);
        toast.success('Cupom adicionado!');
      }
      setIsCouponModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar cupom.');
    }
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newBanners.length) {
      [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
      reorderBanners(newBanners);
    }
  };

  const handleMoveCollection = (index: number, direction: 'up' | 'down') => {
    const newCollections = [...collections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newCollections.length) {
      [newCollections[index], newCollections[targetIndex]] = [newCollections[targetIndex], newCollections[index]];
      reorderCollections(newCollections);
    }
  };

  const handleDuplicateBanner = (banner: Banner) => {
    const newBanner = {
      ...banner,
      id: Math.random().toString(36).substr(2, 9),
      title: `${banner.title} (Cópia)`
    };
    addBanner(newBanner);
    toast.success('Banner duplicado!');
  };

  const handleDuplicateCollection = (collection: Collection) => {
    const newCollection = {
      ...collection,
      id: Math.random().toString(36).substr(2, 9),
      name: `${collection.name} (Cópia)`
    };
    addCollection(newCollection);
    toast.success('Coleção duplicada!');
  };

  const getHierarchicalCollections = (parentId?: string, depth = 0): { id: string, name: string, depth: number }[] => {
    return collections
      .filter(c => c.parentId === parentId)
      .reduce((acc, c) => [
        ...acc,
        { id: c.id, name: c.name, depth },
        ...getHierarchicalCollections(c.id, depth + 1)
      ], [] as { id: string, name: string, depth: number }[]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-black text-black tracking-tighter uppercase">NEXUS ADMIN</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Painel de Gestão</p>
        </div>

        <div className="flex-1 p-4 space-y-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              activeTab === 'dashboard' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>

          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id as Tab)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all",
                        activeTab === item.id || (item.subItems?.some(si => si.id === activeTab))
                          ? "bg-gray-100 text-black" 
                          : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.subItems && (
                        <ChevronDown size={14} className={cn("transition-transform", (item.subItems?.some(si => si.id === activeTab)) ? "rotate-180" : "")} />
                      )}
                    </button>
                    
                    {item.subItems && (activeTab === item.id || item.subItems.some(si => si.id === activeTab)) && (
                      <div className="mt-1 ml-9 space-y-1">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id as Tab);
                              if (subItem.id === 'import') setIsImportModalOpen(true);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all",
                              activeTab === subItem.id ? "text-black bg-gray-50" : "text-gray-400 hover:text-black hover:bg-gray-50"
                            )}
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-black truncate">Admin</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">admin@nexus.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tighter uppercase">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Produtos'}
                {activeTab === 'orders' && 'Lista de Vendas'}
                {activeTab === 'manual-orders' && 'Pedidos Manuais'}
                {activeTab === 'abandoned-carts' && 'Carrinhos Abandonados'}
                {activeTab === 'banners' && 'Banners'}
                {activeTab === 'users' && 'Clientes'}
                {activeTab === 'collections' && 'Categorias'}
                {activeTab === 'reviews' && 'Avaliações'}
                {activeTab === 'payment' && 'Configurações de Pagamento'}
                {activeTab === 'new-arrivals' && 'Lançamentos'}
                {activeTab === 'marketing' && 'Marketing e Pop-ups'}
                {activeTab === 'import' && 'Importar Produtos'}
              </h2>
              <p className="text-gray-500 font-medium">
                {activeTab === 'dashboard' && 'Visão geral do desempenho da sua loja.'}
                {activeTab === 'products' && 'Gerencie seu catálogo de produtos.'}
                {activeTab === 'orders' && 'Acompanhe e gerencie todos os pedidos.'}
                {activeTab === 'abandoned-carts' && 'Recupere vendas de carrinhos não finalizados.'}
                {activeTab === 'collections' && 'Organize seus produtos em categorias e subcategorias.'}
                {activeTab === 'new-arrivals' && 'Gerencie os produtos que aparecem na seção de novidades.'}
                {activeTab === 'marketing' && 'Gerencie o popup de cupom de boas-vindas e as notificações de compras dinâmicas.'}
                {activeTab === 'import' && 'Importe produtos de outros sites Shopify inserindo a URL da coleção ou da página inicial.'}
              </p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'products' && (
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> Novo Produto
                </button>
              )}
              {activeTab === 'banners' && (
                <button
                  onClick={() => handleOpenBannerModal()}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> Novo Banner
                </button>
              )}
              {activeTab === 'collections' && (
                <button
                  onClick={() => handleOpenCollectionModal()}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> Nova Categoria
                </button>
              )}
              {activeTab === 'reviews' && (
                <button
                  onClick={() => handleOpenReviewModal()}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> Nova Avaliação
                </button>
              )}
              {activeTab === 'payment' && (
                <button
                  onClick={() => updatePaymentConfig(paymentFormData)}
                  className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Save size={20} /> Salvar Configurações
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          {activeTab === 'new-arrivals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest">Produtos em Lançamento</h3>
                  <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {products.filter(p => p.isNewArrival).length} Produtos
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.filter(p => p.isNewArrival).map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <p className="font-bold text-sm text-black">{product.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{product.team}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm text-black">R$ {product.price.toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => toggleNewArrival(product)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              title="Remover dos Lançamentos"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.filter(p => p.isNewArrival).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Zap size={32} className="text-gray-200" />
                              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhum produto em lançamentos</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-1">Adicionar aos Lançamentos</h3>
                    <p className="text-xs text-gray-400 font-medium tracking-tight">Pesquise e selecione os produtos que deseja destacar</p>
                  </div>
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Pesquisar produtos..."
                      value={newArrivalsSearch}
                      onChange={(e) => setNewArrivalsSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {products
                    .filter(p => !p.isNewArrival && (
                      p.name.toLowerCase().includes(newArrivalsSearch.toLowerCase()) ||
                      p.team.toLowerCase().includes(newArrivalsSearch.toLowerCase()) ||
                      p.category.toLowerCase().includes(newArrivalsSearch.toLowerCase())
                    ))
                    .map(product => (
                      <div key={product.id} className="bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-gray-200 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-xs text-black line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.team}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNewArrival(product)}
                          className="p-2 bg-white text-black hover:bg-black hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ))}
                  {products.filter(p => !p.isNewArrival && (
                    p.name.toLowerCase().includes(newArrivalsSearch.toLowerCase()) ||
                    p.team.toLowerCase().includes(newArrivalsSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(newArrivalsSearch.toLowerCase())
                  )).length === 0 && (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Nenhum produto disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
                  <p className="text-2xl font-black text-black tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-8">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase">Vendas nos últimos 7 dias</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f9fafb' }}
                        />
                        <Bar dataKey="vendas" fill="#000000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase">Distribuição por Categoria</h3>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 ml-4">
                      {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}



            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length === products.length && products.length > 0}
                    onChange={toggleAllProducts}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {selectedProductIds.length} selecionados
                  </span>
                </div>
                <AnimatePresence>
                  {selectedProductIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={() => setIsBulkPriceModalOpen(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-xs flex items-center gap-2"
                      >
                        <DollarSign size={14} /> Alterar Preço
                      </button>
                      <button
                        onClick={() => setIsBulkCollectionModalOpen(true)}
                        className="px-4 py-2 bg-purple-50 text-purple-600 font-bold rounded-xl hover:bg-purple-100 transition-all text-xs flex items-center gap-2"
                      >
                        <Filter size={14} /> Mover p/ Categoria
                      </button>
                      <button
                        onClick={() => setIsBulkStockModalOpen(true)}
                        className="px-4 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs flex items-center gap-2"
                      >
                        <Package size={14} /> Estoque
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate(true)}
                        className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-all text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Ativar
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate(false)}
                        className="px-4 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-xs flex items-center gap-2"
                      >
                        <AlertCircle size={14} /> Desativar
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-xs flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Excluir Selecionados
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 w-10"></th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estoque</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className={cn(
                      "hover:bg-gray-50/50 transition-colors",
                      selectedProductIds.includes(product.id) && "bg-black/[0.02]"
                    )}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={product.image || undefined} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-black leading-tight">{product.name}</p>
                              {product.active === false && (
                                <span className="text-[8px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Inativo</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-black">R$ {product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          product.stock < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                        )}>
                          {product.stock} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/30">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, email ou ID..."
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none text-sm font-bold text-gray-500 uppercase tracking-widest"
                  >
                    <option value="all">Todos Status</option>
                    <option value="pending">Pendente</option>
                    <option value="preparing">Preparando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pedido</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders
                      .filter(o => 
                        (o.customerName.toLowerCase().includes(orderFilter.toLowerCase()) || 
                         o.customerEmail.toLowerCase().includes(orderFilter.toLowerCase()) ||
                         o.id.includes(orderFilter)) &&
                        (orderStatusFilter === 'all' || o.status === orderStatusFilter)
                      )
                      .map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-black">#{order.id}</span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{formatDate(order.date)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-black">{order.customerName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order.items.length} itens • {order.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-black">R$ {order.total.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrder({ ...order, status: e.target.value as any })}
                            className={cn(
                              "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border-none focus:ring-2 focus:ring-black/5",
                              order.status === 'pending' && "bg-yellow-50 text-yellow-600",
                              order.status === 'preparing' && "bg-blue-50 text-blue-600",
                              order.status === 'shipped' && "bg-purple-50 text-purple-600",
                              order.status === 'delivered' && "bg-green-50 text-green-600",
                              order.status === 'cancelled' && "bg-red-50 text-red-600"
                            )}
                          >
                            <option value="pending">Pendente</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-black transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manual-orders' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-black tracking-tighter uppercase mb-2">Pedidos Manuais</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Esta funcionalidade permite que você crie pedidos manualmente para seus clientes. Ideal para vendas via WhatsApp ou Instagram.
              </p>
              <button 
                onClick={() => setIsManualOrderModalOpen(true)}
                className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
              >
                Criar Novo Pedido Manual
              </button>
            </div>
          )}

          {activeTab === 'abandoned-carts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente / Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Itens</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {abandonedCarts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                        Nenhum carrinho abandonado encontrado
                      </td>
                    </tr>
                  ) : (
                    abandonedCarts.map((cart) => (
                      <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{formatDate(cart.date)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-black">{cart.customerName || 'Visitante'}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{cart.customerEmail || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {cart.items.slice(0, 3).map((item, i) => (
                              <img key={i} src={item.image || undefined} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                            ))}
                            {cart.items.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                                +{cart.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-black">R$ {cart.total.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                if (window.confirm('Deseja excluir este registro de carrinho abandonado?')) {
                                  deleteAbandonedCart(cart.id);
                                  toast.success('Carrinho abandonado excluído!');
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cargo</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-black">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                          user.role === 'admin' ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-500"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.id !== 'admin-1' && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center px-8 pt-8">
                <div>
                  <h3 className="text-xl font-black text-black tracking-tighter uppercase">Gestão de Cupons</h3>
                  <p className="text-sm text-gray-400 font-medium tracking-tight">Crie e gerencie seus cupons de desconto e campanhas de indicação</p>
                </div>
                <button
                  onClick={() => handleOpenCouponModal()}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                >
                  <Plus size={20} />
                  Novo Cupom
                </button>
              </div>

              <div className="overflow-x-auto px-8 pb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo / Valor</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uso</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                          Nenhum cupom encontrado
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => {
                        const usages = couponUsages.filter(u => u.couponId === coupon.id);
                        const totalDiscounted = usages.reduce((acc, u) => acc + u.discountApplied, 0);
                        
                        return (
                          <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-black tracking-widest">{coupon.code}</span>
                                {coupon.isReferral && (
                                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mt-1">Indicação: {coupon.indicatorName}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-black">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-black">{coupon.usageCount} usos</span>
                                <span className="text-[10px] text-gray-400 font-medium">Total desc.: R$ {totalDiscounted.toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {coupon.active ? (
                                <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-widest">Ativo</span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-400 rounded-full uppercase tracking-widest">Inativo</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenCouponModal(coupon)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Excluir este cupom?')) {
                                      deleteCoupon(coupon.id);
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Coupon Metrics */}
              <div className="px-8 pb-12">
                <h4 className="text-sm font-black text-black tracking-widest uppercase mb-6">Métricas de Uso Recentes</h4>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cupom</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Venda</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desconto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {couponUsages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest">
                            Nenhum uso registrado
                          </td>
                        </tr>
                      ) : (
                        couponUsages.slice(0, 10).map((usage) => (
                          <tr key={usage.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-xs text-gray-500">{formatDate(usage.date)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-black text-black tracking-widest">{usage.couponCode}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-black">{usage.userName}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{usage.userEmail}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-black">R$ {usage.orderTotal.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-green-600">- R$ {usage.discountApplied.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
              {banners.map((banner, index) => (
                <div key={banner.id} className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group relative">
                  <div className="aspect-video relative">
                    <img src={banner.image || undefined} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                      <h3 className="text-white font-black text-xl leading-tight">{banner.title}</h3>
                      <p className="text-white/80 text-xs mt-1">{banner.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2">
                      {banner.active ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <AlertCircle size={12} /> Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1 mr-2">
                        <button
                          onClick={() => handleMoveBanner(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveBanner(index, 'down')}
                          disabled={index === banners.length - 1}
                          className="p-1 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDuplicateBanner(banner)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenBannerModal(banner)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este banner?')) {
                            deleteBanner(banner.id);
                            toast.success('Banner excluído com sucesso!');
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Para organizar seus produtos, crie categorias e subcategorias que aparecerão no menu da loja.
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {collections
                  .filter(c => !c.parentId) // Only top-level
                  .map(collection => (
                    <CollectionItem 
                      key={collection.id} 
                      collection={collection} 
                      allCollections={collections}
                      onEdit={handleOpenCollectionModal}
                      onDelete={(id) => {
                        deleteCollection(id);
                        toast.success('Categoria excluída!');
                      }}
                      onDuplicate={handleDuplicateCollection}
                      onAddSubCollection={(parentId) => handleOpenCollectionModal(undefined, parentId)}
                      onAddProduct={(categoryName) => {
                        setActiveTab('products');
                        handleOpenModal(undefined, categoryName);
                      }}
                    />
                  ))}
                {collections.length === 0 && (
                  <div className="p-12 text-center">
                    <Filter size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma categoria cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="p-8 space-y-6">
              {!selectedReviewProductId ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-black text-black tracking-tighter uppercase">Produtos com Avaliações</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selecione um produto para gerenciar suas avaliações</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from(new Set(reviews.map(r => r.productId)))
                      .map(productId => {
                        const product = products.find(p => p.id === productId);
                        const productReviews = reviews.filter(r => r.productId === productId);
                        const pendingReviews = productReviews.filter(r => !r.approved).length;
                        const averageRating = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
                        
                        if (reviewSearch && !product?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) && 
                            !productReviews[0]?.productName?.toLowerCase().includes(reviewSearch.toLowerCase())) {
                          return null;
                        }

                        return (
                          <button
                            key={productId}
                            onClick={() => setSelectedReviewProductId(productId)}
                            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group flex items-center gap-4 relative overflow-hidden"
                          >
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                              {product?.image ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ShoppingBag size={24} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-black truncate uppercase tracking-tight mb-1">
                                {product?.name || productReviews[0]?.productName || 'Produto não encontrado'}
                              </h4>
                              <div className="flex items-center gap-1 mb-2">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-xs">
                                      {i < Math.round(averageRating) ? '★' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[10px] font-black text-gray-400">{averageRating.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {productReviews.length} {productReviews.length === 1 ? 'Avaliação' : 'Avaliações'}
                                </span>
                                {pendingReviews > 0 && (
                                  <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[8px] font-black rounded-full uppercase tracking-widest">
                                    {pendingReviews} Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                          </button>
                        );
                      })}
                    {reviews.length === 0 && (
                      <div className="col-span-full p-12 text-center">
                        <Star size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma avaliação cadastrada</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedReviewProductId(null)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-black hover:shadow-md transition-all"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <h3 className="text-xl font-black text-black tracking-tighter uppercase">
                          {products.find(p => p.id === selectedReviewProductId)?.name || 
                           reviews.find(r => r.productId === selectedReviewProductId)?.productName}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gerenciando avaliações deste produto</p>
                      </div>
                    </div>

                    {selectedReviewProductId && (
                      <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-center px-4 border-r border-gray-100">
                          <p className="text-2xl font-black text-black">
                            {(reviews.filter(r => r.productId === selectedReviewProductId).reduce((acc, r) => acc + r.rating, 0) / 
                              reviews.filter(r => r.productId === selectedReviewProductId).length || 0).toFixed(1)}
                          </p>
                          <div className="flex text-yellow-400 justify-center">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-[10px]">
                                {i < Math.round(reviews.filter(r => r.productId === selectedReviewProductId).reduce((acc, r) => acc + r.rating, 0) / 
                                  reviews.filter(r => r.productId === selectedReviewProductId).length || 0) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-center px-4">
                          <p className="text-2xl font-black text-black">
                            {reviews.filter(r => r.productId === selectedReviewProductId).length}
                          </p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total de Avaliações</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {reviews
                      .filter(r => r.productId === selectedReviewProductId)
                      .map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={cn("text-lg", i < review.rating ? "fill-current" : "text-gray-200")}>★</span>
                                ))}
                              </div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(review.date)}</span>
                              {!review.approved && (
                                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                                  <AlertCircle size={10} /> Pendente
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-black mb-1">{review.userName}</p>
                            <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                            {review.images && review.images.length > 0 && (
                              <div className="flex gap-2 mt-4">
                                {review.images.map((img, i) => (
                                  <img key={i} src={img || undefined} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex md:flex-col gap-2 justify-end">
                            {!review.approved && (
                              <button
                                onClick={() => updateReview({ ...review, approved: true })}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Aprovar"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenReviewModal(review)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
                                  deleteReview(review.id);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="p-8 max-w-3xl">
              <div className="space-y-8">
                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase flex items-center gap-2">
                    <Users size={20} /> Informações de Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp / Telefone</label>
                      <input
                        type="text"
                        value={paymentFormData.contactPhone || ''}
                        onChange={e => setPaymentFormData({ ...paymentFormData, contactPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        placeholder="Ex: 5511999999999"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email de Contato</label>
                      <input
                        type="email"
                        value={paymentFormData.contactEmail || ''}
                        onChange={e => setPaymentFormData({ ...paymentFormData, contactEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        placeholder="Ex: contato@loja.com"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL do Instagram</label>
                      <input
                        type="text"
                        value={paymentFormData.instagramUrl || ''}
                        onChange={e => setPaymentFormData({ ...paymentFormData, instagramUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        placeholder="Ex: https://instagram.com/sualoja"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase flex items-center gap-2">
                    <DollarSign size={20} /> Configuração de PIX
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chave PIX</label>
                      <input
                        type="text"
                        value={paymentFormData.pixKey || ''}
                        onChange={e => setPaymentFormData({ ...paymentFormData, pixKey: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        placeholder="Ex: CNPJ, Email ou Celular"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL do QR Code (Imagem)</label>
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={paymentFormData.pixQrCode || ''}
                            onChange={e => setPaymentFormData({ ...paymentFormData, pixQrCode: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="https://..."
                          />
                        </div>
                        <label className="cursor-pointer px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-600 font-bold text-xs">
                          <Upload size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, (url) => setPaymentFormData({ ...paymentFormData, pixQrCode: url }))}
                          />
                          Upload
                        </label>
                        {paymentFormData.pixQrCode && (
                          <img src={paymentFormData.pixQrCode || undefined} alt="" className="w-12 h-12 rounded-xl object-cover bg-white p-1 border border-gray-200" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legenda/Instruções PIX</label>
                      <textarea
                        value={paymentFormData.pixLegend || ''}
                        onChange={e => setPaymentFormData({ ...paymentFormData, pixLegend: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                        placeholder="Instruções que aparecerão no checkout..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase flex items-center gap-2">
                    <Package size={20} /> Frete e Entrega
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor do Frete Fixo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentFormData.shippingFee || 0}
                      onChange={e => setPaymentFormData({ ...paymentFormData, shippingFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <h3 className="text-lg font-black text-black tracking-tighter mb-6 uppercase flex items-center gap-2">
                    <Package size={20} /> Cartão de Crédito
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instruções Cartão</label>
                    <textarea
                      value={paymentFormData.creditCardInfo || ''}
                      onChange={e => setPaymentFormData({ ...paymentFormData, creditCardInfo: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                      placeholder="Ex: Você receberá um link de pagamento..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      updatePaymentConfig(paymentFormData);
                      toast.success('Configurações de pagamento salvas com sucesso!');
                    }}
                    className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="p-8 max-w-3xl">
              <div className="space-y-8">
                {/* Pop-up de Boas-Vindas */}
                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-black tracking-tighter uppercase flex items-center gap-2">
                      <Gift size={20} /> Pop-up de Boas-Vindas (Cupom)
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={marketingForm.popupActive}
                        onChange={e => setMarketingForm({ ...marketingForm, popupActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CCFF00] dark:peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {marketingForm.popupActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título do Pop-up</label>
                      <input
                        type="text"
                        value={marketingForm.popupTitle}
                        onChange={e => setMarketingForm({ ...marketingForm, popupTitle: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        placeholder="Ex: 🔥 BEM-VINDO À NEXUS STORE!"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mensagem de Boas-Vindas</label>
                      <textarea
                        value={marketingForm.popupMessage}
                        onChange={e => setMarketingForm({ ...marketingForm, popupMessage: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                        placeholder="Escreva a mensagem do popup..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código do Cupom</label>
                      <input
                        type="text"
                        value={marketingForm.popupCoupon}
                        onChange={e => setMarketingForm({ ...marketingForm, popupCoupon: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono uppercase"
                        placeholder="Ex: NEXUS10"
                      />
                    </div>
                  </div>
                </div>

                {/* Notificações Flutuantes (Social Proof) */}
                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-black tracking-tighter uppercase flex items-center gap-2">
                      <ShoppingBag size={20} /> Notificações de Compra (Social Proof)
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={marketingForm.toastActive}
                        onChange={e => setMarketingForm({ ...marketingForm, toastActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CCFF00] dark:peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {marketingForm.toastActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Compradores (separados por vírgula)</label>
                      <textarea
                        value={marketingForm.toastBuyers}
                        onChange={e => setMarketingForm({ ...marketingForm, toastBuyers: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24"
                        placeholder="Thiago, Amanda, Lucas, Carla..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Cidades/Estados (separados por vírgula)</label>
                      <textarea
                        value={marketingForm.toastLocations}
                        onChange={e => setMarketingForm({ ...marketingForm, toastLocations: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24"
                        placeholder="São Paulo/SP, Rio de Janeiro/RJ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequência das Notificações (em segundos)</label>
                      <input
                        type="number"
                        min="5"
                        value={marketingForm.toastInterval}
                        onChange={e => setMarketingForm({ ...marketingForm, toastInterval: parseInt(e.target.value) || 20 })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      try {
                        const buyersArray = marketingForm.toastBuyers.split(',').map((s: string) => s.trim()).filter(Boolean);
                        const locationsArray = marketingForm.toastLocations.split(',').map((s: string) => s.trim()).filter(Boolean);
                        
                        const configToSave = {
                          ...marketingForm,
                          toastBuyers: buyersArray,
                          toastLocations: locationsArray
                        };
                        
                        localStorage.setItem('nexus_marketing_config', JSON.stringify(configToSave));
                        window.dispatchEvent(new Event('nexus_marketing_config_updated'));
                        toast.success('Configurações de marketing salvas com sucesso!');
                      } catch (err) {
                        toast.error('Erro ao salvar as configurações.');
                      }
                    }}
                    className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Marketing
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="max-w-xl space-y-4">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <Upload size={20} /> Importar de um site Shopify
                </h3>
                <p className="text-sm text-gray-500">
                  Insira o link completo de uma coleção ou da página inicial de qualquer loja Shopify para importar os produtos automaticamente para o seu catálogo.
                </p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="https://exemplo.com/collections/all"
                    disabled={importLoading}
                  />
                  <button
                    onClick={async () => {
                      if (!importUrl) {
                        toast.error('Insira uma URL válida.');
                        return;
                      }
                      setImportLoading(true);
                      try {
                        const imported = await importProductsFromUrl(importUrl);
                        if (imported && imported.length > 0) {
                          await importProducts(imported);
                          setImportUrl('');
                        } else {
                          toast.error('Nenhum produto encontrado ou falha na importação. Certifique-se de que é uma loja Shopify pública.');
                        }
                      } catch (error) {
                        toast.error('Erro ao importar produtos.');
                        console.error(error);
                      } finally {
                        setImportLoading(false);
                      }
                    }}
                    disabled={importLoading}
                    className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-300 cursor-pointer"
                  >
                    {importLoading ? 'Importando...' : 'Importar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Manual Order Modal */}
      <AnimatePresence>
        {isManualOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualOrderModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter uppercase">Novo Pedido Manual</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Crie um pedido para um cliente</p>
                </div>
                <button
                  onClick={() => setIsManualOrderModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <p className="text-center text-gray-500 font-medium py-12">
                  Funcionalidade de criação de pedido manual em desenvolvimento.
                  <br />
                  <span className="text-[10px] uppercase font-bold text-gray-400 mt-4 block">Em breve: Seleção de produtos, cliente e frete.</span>
                </p>
                
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setIsManualOrderModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">
                    {editingProduct ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Preencha os detalhes abaixo</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Camisa</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Ex: Camisa Flamengo Home 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</label>
                    <input
                      type="text"
                      value={formData.team || ''}
                      onChange={e => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Ex: Flamengo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Liga / Campeonato</label>
                    <input
                      type="text"
                      value={formData.league || ''}
                      onChange={e => setFormData({ ...formData, league: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Ex: Brasileirão"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço de Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Original ("De") (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice || 0}
                      onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Deixe 0 se não houver promoção"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice || 0}
                      onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL da Imagem Principal</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={formData.image || ''}
                          onChange={e => setFormData({ ...formData, image: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <label className="cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 text-gray-600 font-bold text-xs">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, (url) => setFormData({ ...formData, image: url }))}
                        />
                        Upload
                      </label>
                      {formData.image && (
                        <img src={formData.image || undefined} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outras Imagens</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <textarea
                          value={(formData.images || []).join('\n')}
                          onChange={e => setFormData({ ...formData, images: e.target.value.split('\n').filter(url => url.trim()) })}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                          placeholder="URLs das imagens (uma por linha)..."
                        />
                        <label className="cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 font-bold text-xs min-w-[100px]">
                          <Upload size={20} />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleMultipleFilesUpload(e, formData.images || [], (urls) => setFormData({ ...formData, images: urls }))}
                          />
                          Upload
                        </label>
                      </div>
                      {formData.images && formData.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img src={img || undefined} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, idx) => idx !== i) })}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria / Coleção</label>
                    <select
                      value={formData.category || ''}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      {getHierarchicalCollections().map(c => (
                        <option key={c.id} value={c.name}>
                          {'\u00A0'.repeat(c.depth * 4)}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <div className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.active !== false}
                          onChange={e => setFormData({ ...formData, active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Produto Ativo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer border-t border-gray-100 pt-2">
                        <input
                          type="checkbox"
                          checked={!!formData.isNewArrival}
                          onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Lançamento</span>
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estoque por Tamanho</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Novo tamanho (ex: XL)"
                          value={newSize}
                          onChange={e => setNewSize(e.target.value)}
                          className="px-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black w-32"
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="p-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.sizes?.map((size, index) => (
                        <div key={size} className="space-y-1 relative group">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">{size}</label>
                              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSize(index, 'up')}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-black disabled:opacity-0"
                                >
                                  <ChevronUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSize(index, 'down')}
                                  disabled={index === (formData.sizes?.length || 0) - 1}
                                  className="text-gray-400 hover:text-black disabled:opacity-0"
                                >
                                  <ChevronDown size={10} />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={formData.sizeStock?.[size] || 0}
                            onChange={e => setFormData({
                              ...formData,
                              sizeStock: {
                                ...formData.sizeStock,
                                [size]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Produto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Price Modal */}
      <AnimatePresence>
        {isBulkPriceModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkPriceModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">ALTERAÇÃO EM MASSA</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Atualizar preço de {selectedProductIds.length} produtos</p>
                </div>
                <button
                  onClick={() => setIsBulkPriceModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Alteração</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setBulkPriceType('fixed')}
                      className={cn(
                        "py-3 px-2 rounded-xl font-bold text-[11px] transition-all",
                        bulkPriceType === 'fixed' ? "bg-black text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      Preço Fixo
                    </button>
                    <button
                      onClick={() => setBulkPriceType('percentage')}
                      className={cn(
                        "py-3 px-2 rounded-xl font-bold text-[11px] transition-all",
                        bulkPriceType === 'percentage' ? "bg-black text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      Aumento (%)
                    </button>
                    <button
                      onClick={() => setBulkPriceType('add')}
                      className={cn(
                        "py-3 px-2 rounded-xl font-bold text-[11px] transition-all",
                        bulkPriceType === 'add' ? "bg-black text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      Soma Fixa
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {bulkPriceType === 'fixed' ? 'Novo Valor (R$)' : bulkPriceType === 'percentage' ? 'Porcentagem de Aumento (%)' : 'Valor a Somar (R$)'}
                  </label>
                  <input
                    type="number"
                    value={bulkPriceValue}
                    onChange={e => setBulkPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder={bulkPriceType === 'fixed' ? "0.00" : bulkPriceType === 'percentage' ? "10" : "5.00"}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsBulkPriceModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkPriceUpdate}
                    className="flex-1 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Collection Modal */}
      <AnimatePresence>
        {isBulkCollectionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkCollectionModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter uppercase">MOVER CATEGORIA</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Mover {selectedProductIds.length} produtos</p>
                </div>
                <button
                  onClick={() => setIsBulkCollectionModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selecione a Categoria</label>
                  <select
                    value={bulkCollectionId}
                    onChange={e => setBulkCollectionId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  >
                    <option value="">Selecione...</option>
                    {getHierarchicalCollections().map(c => (
                      <option key={c.id} value={c.id}>
                        {'\u00A0'.repeat(c.depth * 4)}{c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsBulkCollectionModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkCollectionUpdate}
                    className="flex-1 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                  >
                    Mover
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Stock Modal */}
      <AnimatePresence>
        {isBulkStockModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkStockModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter uppercase">ATUALIZAR ESTOQUE</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Definir estoque para {selectedProductIds.length} produtos</p>
                </div>
                <button
                  onClick={() => setIsBulkStockModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Novo Estoque por Tamanho</label>
                  <input
                    type="number"
                    value={bulkStockValue}
                    onChange={e => setBulkStockValue(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-gray-400 italic">Este valor será aplicado a todos os tamanhos de cada produto selecionado.</p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsBulkStockModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleBulkStockUpdate}
                    className="flex-1 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">
                    {editingCoupon ? 'EDITAR CUPOM' : 'NOVO CUPOM'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure as regras do desconto</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCouponSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código do Cupom</label>
                    <input
                      type="text"
                      value={couponFormData.code || ''}
                      onChange={e => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none font-black tracking-widest"
                      placeholder="EX: BEMVINDO10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo de Desconto</label>
                    <select
                      value={couponFormData.type || 'percentage'}
                      onChange={e => setCouponFormData({ ...couponFormData, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none font-bold"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Valor do Desconto {couponFormData.type === 'percentage' ? '(%)' : '(R$)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={couponFormData.value || 0}
                      onChange={e => setCouponFormData({ ...couponFormData, value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limite de Uso Total</label>
                    <input
                      type="number"
                      value={couponFormData.maxUsage || ''}
                      onChange={e => setCouponFormData({ ...couponFormData, maxUsage: parseInt(e.target.value) || undefined })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                      placeholder="Ilimitado"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Mínimo do Pedido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={couponFormData.minOrderValue || ''}
                      onChange={e => setCouponFormData({ ...couponFormData, minOrderValue: parseFloat(e.target.value) || undefined })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                      placeholder="Nenhum"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data de Expiração</label>
                    <input
                      type="date"
                      value={couponFormData.expiryDate ? couponFormData.expiryDate.split('T')[0] : ''}
                      onChange={e => setCouponFormData({ ...couponFormData, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 p-6 bg-purple-50 rounded-[24px] border border-purple-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="text-purple-600" size={20} />
                        <h4 className="text-sm font-black text-purple-900 tracking-widest uppercase">Programa de Indicação</h4>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!couponFormData.isReferral}
                          onChange={e => setCouponFormData({ ...couponFormData, isReferral: e.target.checked })}
                          className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">Ativar Indicação</span>
                      </label>
                    </div>
                    
                    {couponFormData.isReferral && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Nome do Indicador</label>
                          <input
                            type="text"
                            value={couponFormData.indicatorName || ''}
                            onChange={e => setCouponFormData({ ...couponFormData, indicatorName: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-purple-100 rounded-xl focus:outline-none text-sm"
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Tipo de Recompensa</label>
                          <select
                            value={couponFormData.indicatorRewardType || 'fixed'}
                            onChange={e => setCouponFormData({ ...couponFormData, indicatorRewardType: e.target.value as 'percentage' | 'fixed' })}
                            className="w-full px-4 py-2 bg-white border border-purple-100 rounded-xl focus:outline-none text-sm font-bold"
                          >
                            <option value="fixed">Valor Fixo (R$)</option>
                            <option value="percentage">Porcentagem (%)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                            Recompensa por Uso {couponFormData.indicatorRewardType === 'percentage' ? '(%)' : '(R$)'}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={couponFormData.indicatorRewardPerUse || 0}
                            onChange={e => setCouponFormData({ ...couponFormData, indicatorRewardPerUse: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 bg-white border border-purple-100 rounded-xl focus:outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Usuário Atrelado (Opcional)</label>
                          <select
                            value={couponFormData.assignedUserId || ''}
                            onChange={e => setCouponFormData({ ...couponFormData, assignedUserId: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-purple-100 rounded-xl focus:outline-none text-sm"
                          >
                            <option value="">Nenhum</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Comissão do Parceiro (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={couponFormData.commissionPercentage || 0}
                            onChange={e => setCouponFormData({ ...couponFormData, commissionPercentage: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 bg-white border border-purple-100 rounded-xl focus:outline-none text-sm"
                            placeholder="Ex: 5.0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <input
                        type="checkbox"
                        checked={couponFormData.active !== false}
                        onChange={e => setCouponFormData({ ...couponFormData, active: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Cupom Ativo e Disponível para Uso</span>
                    </label>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Cupom
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collection Modal */}
      <AnimatePresence>
        {isCollectionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollectionModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">
                    {editingCollection ? 'EDITAR COLEÇÃO' : 'NOVA COLEÇÃO'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Organize seus produtos</p>
                </div>
                <button
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCollectionSubmit} className="p-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Coleção</label>
                    <input
                      type="text"
                      value={collectionFormData.name || ''}
                      onChange={e => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Ex: LANÇAMENTOS 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria Pai (Opcional)</label>
                    <select
                      value={collectionFormData.parentId || ''}
                      onChange={e => setCollectionFormData({ ...collectionFormData, parentId: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    >
                      <option value="">Nenhuma (Categoria Principal)</option>
                      {getHierarchicalCollections()
                        .filter(c => c.id !== editingCollection?.id) // Prevent self-parenting
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {'\u00A0'.repeat(c.depth * 4)}{c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
                    <textarea
                      value={collectionFormData.description || ''}
                      onChange={e => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL da Imagem</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={collectionFormData.image || ''}
                          onChange={e => setCollectionFormData({ ...collectionFormData, image: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                      </div>
                      <label className="cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 text-gray-600 font-bold text-xs">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, (url) => setCollectionFormData({ ...collectionFormData, image: url }))}
                        />
                        Upload
                      </label>
                      {collectionFormData.image && (
                        <img src={collectionFormData.image || undefined} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select
                      value={collectionFormData.active ? 'true' : 'false'}
                      onChange={e => setCollectionFormData({ ...collectionFormData, active: e.target.value === 'true' })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!collectionFormData.isGuide}
                        onChange={e => setCollectionFormData({ ...collectionFormData, isGuide: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coleção Guia (Mostra produtos das subcategorias)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCollectionModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Coleção
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">
                    {editingReview ? 'EDITAR AVALIAÇÃO' : 'NOVA AVALIAÇÃO'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gerencie o feedback dos clientes</p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Cliente</label>
                    <input
                      type="text"
                      value={reviewFormData.userName || ''}
                      onChange={e => setReviewFormData({ ...reviewFormData, userName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avaliação (1-5)</label>
                    <select
                      value={reviewFormData.rating}
                      onChange={e => setReviewFormData({ ...reviewFormData, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n} Estrelas</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</label>
                    <select
                      value={reviewFormData.productId || ''}
                      onChange={e => {
                        const product = products.find(p => p.id === e.target.value);
                        setReviewFormData({ 
                          ...reviewFormData, 
                          productId: e.target.value,
                          productName: product?.name || ''
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      <option value="">Selecione um produto</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comentário</label>
                    <textarea
                      value={reviewFormData.comment || ''}
                      onChange={e => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select
                      value={reviewFormData.approved ? 'true' : 'false'}
                      onChange={e => setReviewFormData({ ...reviewFormData, approved: e.target.value === 'true' })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      <option value="true">Aprovada</option>
                      <option value="false">Pendente</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Imagens da Avaliação</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <textarea
                          value={reviewFormData.images?.join('\n')}
                          onChange={e => setReviewFormData({ ...reviewFormData, images: e.target.value.split('\n').filter(url => url.trim()) })}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                          placeholder="URLs das imagens (uma por linha)..."
                        />
                        <label className="cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 font-bold text-xs min-w-[100px]">
                          <Upload size={20} />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleMultipleFilesUpload(e, reviewFormData.images || [], (urls) => setReviewFormData({ ...reviewFormData, images: urls }))}
                          />
                          Upload
                        </label>
                      </div>
                      {reviewFormData.images && reviewFormData.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {reviewFormData.images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img src={img || undefined} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                              <button
                                type="button"
                                onClick={() => setReviewFormData({ ...reviewFormData, images: reviewFormData.images?.filter((_, idx) => idx !== i) })}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Avaliação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">DETALHES DO PEDIDO #{selectedOrder.id}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gestão de status e entrega</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Informações do Cliente</h3>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-black">{selectedOrder.customerName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                        <p className="text-sm text-gray-600">CPF: {selectedOrder.customerCpf}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Endereço de Entrega</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number}</p>
                        {selectedOrder.shippingAddress.complement && <p>{selectedOrder.shippingAddress.complement}</p>}
                        <p>{selectedOrder.shippingAddress.neighborhood}</p>
                        <p>{selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.state}</p>
                        <p>CEP: {selectedOrder.shippingAddress.zipCode}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Pagamento</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black uppercase">{selectedOrder.paymentMethod}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                          selectedOrder.status === 'pending' ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                        )}>
                          {selectedOrder.status === 'pending' ? 'Aguardando' : 'Confirmado'}
                        </span>
                      </div>
                    </section>
                  </div>

                  {/* Order Management */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Gestão do Pedido</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status do Pedido</label>
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => {
                              const updated = { ...selectedOrder, status: e.target.value as any };
                              setSelectedOrder(updated);
                              updateOrder(updated);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                          >
                            <option value="pending">Pendente</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código de Rastreio</label>
                          <input
                            type="text"
                            value={selectedOrder.trackingCode || ''}
                            onChange={(e) => {
                              const updated = { ...selectedOrder, trackingCode: e.target.value };
                              setSelectedOrder(updated);
                              updateOrder(updated);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="Ex: BR123456789"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notas do Administrador (Visível ao Cliente)</label>
                          <textarea
                            value={selectedOrder.adminNotes || ''}
                            onChange={(e) => {
                              const updated = { ...selectedOrder, adminNotes: e.target.value };
                              setSelectedOrder(updated);
                              updateOrder(updated);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                            placeholder="Ex: Seu pedido está sendo embalado com carinho..."
                          />
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mt-12">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Itens do Pedido</h3>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100/50">
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
                          <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qtd</th>
                          <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedOrder.items.map((item, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={item.image || undefined} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-sm font-bold text-black">{item.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tam: {item.selectedSize}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-black">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100/50">
                          <td colSpan={2} className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total do Pedido</td>
                          <td className="px-6 py-4 text-right text-lg font-black text-black tracking-tighter">R$ {selectedOrder.total.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Banner Modal */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tighter">
                    {editingBanner ? 'EDITAR BANNER' : 'NOVO BANNER'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure o destaque da sua loja</p>
                </div>
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleBannerSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título do Banner</label>
                    <input
                      type="text"
                      value={bannerFormData.title || ''}
                      onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Ex: VISTA SEU MANTO COM A NEXUS"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtítulo</label>
                    <textarea
                      value={bannerFormData.subtitle || ''}
                      onChange={e => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-24 resize-none"
                      placeholder="Ex: As melhores camisas de time do mundo..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL da Imagem de Fundo</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={bannerFormData.image || ''}
                          onChange={e => setBannerFormData({ ...bannerFormData, image: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <label className="cursor-pointer px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 text-gray-600 font-bold text-xs">
                        <Upload size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleFileUpload(e, (url) => setBannerFormData({ ...bannerFormData, image: url }))}
                        />
                        Upload
                      </label>
                      {bannerFormData.image && (
                        <img src={bannerFormData.image || undefined} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Texto do Botão</label>
                      <input
                        type="text"
                        value={bannerFormData.buttonText || ''}
                        onChange={e => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                      <select
                        value={bannerFormData.active ? 'true' : 'false'}
                        onChange={e => setBannerFormData({ ...bannerFormData, active: e.target.value === 'true' })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <Save size={20} /> Salvar Banner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
