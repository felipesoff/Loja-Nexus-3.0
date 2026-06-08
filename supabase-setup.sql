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
    promotionalPrice DECIMAL,
    costPrice DECIMAL,
    originalPrice DECIMAL,
    image TEXT,
    images JSONB,
    description TEXT,
    category TEXT,
    sizes JSONB,
    sizeStock JSONB,
    stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    isNewArrival BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Banners
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image TEXT,
    buttonText TEXT,
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
    parentId TEXT,
    featured BOOLEAN DEFAULT false,
    isGuide BOOLEAN DEFAULT false,
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
    minOrderValue DECIMAL,
    maxOrderValue DECIMAL,
    minQuantity INTEGER,
    maxQuantity INTEGER,
    active BOOLEAN DEFAULT true,
    usageCount INTEGER DEFAULT 0,
    maxUsage INTEGER,
    expiryDate TEXT,
    isReferral BOOLEAN DEFAULT false,
    indicatorName TEXT,
    indicatorRewardType TEXT,
    indicatorRewardPerUse DECIMAL,
    assignedUserId TEXT,
    commissionPercentage DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    items JSONB NOT NULL,
    total DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    customerName TEXT,
    customerEmail TEXT,
    customerCpf TEXT,
    shippingAddress JSONB,
    date TEXT,
    paymentMethod TEXT,
    trackingCode TEXT,
    adminNotes TEXT,
    couponCode TEXT,
    discount DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    productId TEXT,
    productName TEXT,
    userId TEXT,
    userName TEXT,
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
    couponId TEXT,
    couponCode TEXT,
    userId TEXT,
    userName TEXT,
    userEmail TEXT,
    orderId TEXT,
    orderTotal DECIMAL,
    discountApplied DECIMAL,
    date TEXT,
    commissionEarned DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Drop Policies if they already exist to prevent duplicate errors
DROP POLICY IF EXISTS "Allow public read" ON public.products;
DROP POLICY IF EXISTS "Allow public read" ON public.banners;
DROP POLICY IF EXISTS "Allow public read" ON public.collections;
DROP POLICY IF EXISTS "Allow public read" ON public.config;
DROP POLICY IF EXISTS "Allow public read" ON public.reviews;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can see their own orders" ON public.orders;

-- Basic Policies (Allow all for development, you can harden later)
CREATE POLICY "Allow public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.config FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.reviews FOR SELECT USING (true);

-- Authenticated Policies
CREATE POLICY "Users can see their own profile" ON public.profiles FOR SELECT USING (auth.uid()::text = id OR email = auth.jwt()->>'email');
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT USING (auth.uid()::text = userId OR customerEmail = auth.jwt()->>'email');
