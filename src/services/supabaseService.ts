import { supabase } from '../lib/supabase';
import { Product, Order, Banner, Review, Collection, PaymentConfig, Coupon, CouponUsage } from '../types';

export const supabaseService = {
  // Helper to ensure supabase is initialized
  getClient() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }
    return supabase;
  },

  // Products
  async getProducts() {
    const { data, error } = await this.getClient().from('products').select('*');
    if (error) throw error;
    return data as Product[];
  },
  async upsertProduct(product: Product) {
    const { error } = await this.getClient().from('products').upsert(product);
    if (error) throw error;
  },
  async deleteProduct(id: string) {
    const { error } = await this.getClient().from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Banners
  async getBanners() {
    const { data, error } = await this.getClient().from('banners').select('*').order('id');
    if (error) throw error;
    return data as Banner[];
  },
  async upsertBanner(banner: Banner) {
    const { error } = await this.getClient().from('banners').upsert(banner);
    if (error) throw error;
  },
  async deleteBanner(id: string) {
    const { error } = await this.getClient().from('banners').delete().eq('id', id);
    if (error) throw error;
  },

  // Collections
  async getCollections() {
    const { data, error } = await this.getClient().from('collections').select('*');
    if (error) throw error;
    return data as Collection[];
  },
  async upsertCollection(collection: Collection) {
    const { error } = await this.getClient().from('collections').upsert(collection);
    if (error) throw error;
  },
  async deleteCollection(id: string) {
    const { error } = await this.getClient().from('collections').delete().eq('id', id);
    if (error) throw error;
  },

  // Config
  async getConfig() {
    const { data, error } = await this.getClient().from('config').select('*').eq('id', 'global').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value as PaymentConfig;
  },
  async updateConfig(config: PaymentConfig) {
    const { error } = await this.getClient().from('config').upsert({ id: 'global', value: config });
    if (error) throw error;
  },

  // Coupons
  async getCoupons() {
    const { data, error } = await this.getClient().from('coupons').select('*');
    if (error) throw error;
    return data as Coupon[];
  },
  async upsertCoupon(coupon: Coupon) {
    const { error } = await this.getClient().from('coupons').upsert(coupon);
    if (error) throw error;
  },
  async deleteCoupon(id: string) {
    const { error } = await this.getClient().from('coupons').delete().eq('id', id);
    if (error) throw error;
  },

  // Orders
  async getOrders(userId?: string) {
    let query = this.getClient().from('orders').select('*').order('date', { ascending: false });
    if (userId) {
      query = query.eq('userId', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Order[];
  },
  async createOrder(order: Order) {
    const { error } = await this.getClient().from('orders').insert(order);
    if (error) throw error;
  },
  async updateOrder(order: Order) {
    const { error } = await this.getClient().from('orders').update(order).eq('id', order.id);
    if (error) throw error;
  },

  // Reviews
  async getReviews(productId?: string, approvedOnly?: boolean) {
    let query = this.getClient().from('reviews').select('*').order('date', { ascending: false });
    if (productId) query = query.eq('productId', productId);
    if (approvedOnly) query = query.eq('approved', true);
    const { data, error } = await query;
    if (error) throw error;
    return data as Review[];
  },
  async upsertReview(review: Review) {
    const { error } = await this.getClient().from('reviews').upsert(review);
    if (error) throw error;
  },
  async deleteReview(id: string) {
    const { error } = await this.getClient().from('reviews').delete().eq('id', id);
    if (error) throw error;
  },

  // Coupon Usages
  async getCouponUsages() {
    const { data, error } = await this.getClient().from('coupon_usages').select('*');
    if (error) throw error;
    return data as CouponUsage[];
  },
  async createCouponUsage(usage: CouponUsage) {
    const { error } = await this.getClient().from('coupon_usages').insert(usage);
    if (error) throw error;
  },

  // Profiles (Users)
  async upsertProfile(profile: any) {
    const { error } = await this.getClient().from('profiles').upsert(profile);
    if (error) throw error;
  }
};
