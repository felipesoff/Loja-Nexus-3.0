-- Drop existing tables to clean up case-insensitive columns
DROP TABLE IF EXISTS public.coupon_usages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.config CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Can be Firebase ID or Supabase UUID
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    cpf TEXT,
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    firebase_id TEXT -- Optional: to keep track of the original ID
);

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    team TEXT,
    league TEXT,
    price DECIMAL NOT NULL,
    "promotionalPrice" DECIMAL,
    "costPrice" DECIMAL,
    "originalPrice" DECIMAL,
    image TEXT,
    images JSONB,
    description TEXT,
    category TEXT,
    sizes JSONB,
    "sizeStock" JSONB,
    stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    "isNewArrival" BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Banners
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image TEXT,
    "buttonText" TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    active BOOLEAN DEFAULT true,
    "parentId" TEXT,
    featured BOOLEAN DEFAULT false,
    "isGuide" BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Config
CREATE TABLE IF NOT EXISTS public.config (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- percentage, fixed
    value DECIMAL NOT NULL,
    "minOrderValue" DECIMAL,
    "maxOrderValue" DECIMAL,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    active BOOLEAN DEFAULT true,
    "usageCount" INTEGER DEFAULT 0,
    "maxUsage" INTEGER,
    "expiryDate" TEXT,
    "isReferral" BOOLEAN DEFAULT false,
    "indicatorName" TEXT,
    "indicatorRewardType" TEXT,
    "indicatorRewardPerUse" DECIMAL,
    "assignedUserId" TEXT,
    "commissionPercentage" DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    items JSONB NOT NULL,
    total DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerCpf" TEXT,
    "shippingAddress" JSONB,
    date TEXT,
    "paymentMethod" TEXT,
    "trackingCode" TEXT,
    "adminNotes" TEXT,
    "couponCode" TEXT,
    discount DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    "productId" TEXT,
    "productName" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    rating INTEGER,
    comment TEXT,
    images JSONB,
    date TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Coupon Usages
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id TEXT PRIMARY KEY,
    "couponId" TEXT,
    "couponCode" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "orderId" TEXT,
    "orderTotal" DECIMAL,
    "discountApplied" DECIMAL,
    date TEXT,
    "commissionEarned" DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for all tables to allow full client-side CRUD during development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages DISABLE ROW LEVEL SECURITY;
