import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TEAMS = [
  'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Grêmio', 'Internacional', 
  'Atlético Mineiro', 'Cruzeiro', 'Vasco', 'Fluminense', 'Botafogo', 'Santos', 
  'Real Madrid', 'Barcelona', 'Atletico de Madrid', 'Bayern de Munique', 'Bayern Munich',
  'Borussia Dortmund', 'Juventus', 'Milan', 'Inter de Milão', 'Inter Milan', 'Roma',
  'Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham',
  'Paris Saint Germain', 'PSG', 'Ajax', 'Benfica', 'Porto', 'Sporting',
  'Seleção Brasileira', 'Brasil', 'Argentina', 'França', 'Alemanha', 'Itália', 
  'Inglaterra', 'Espanha', 'Portugal', 'Uruguai', 'Colômbia', 'Bélgica', 'Japão'
];

const LEAGUES = [
  { name: 'Brasileirão', keywords: ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Grêmio', 'Internacional', 'Atlético Mineiro', 'Cruzeiro', 'Vasco', 'Fluminense', 'Botafogo', 'Santos', 'Brasileirão', 'Serie A Brasil'] },
  { name: 'La Liga', keywords: ['Real Madrid', 'Barcelona', 'Atletico de Madrid', 'La Liga', 'Espanhol'] },
  { name: 'Premier League', keywords: ['Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham', 'Premier League', 'Inglês'] },
  { name: 'Bundesliga', keywords: ['Bayern', 'Borussia', 'Dortmund', 'Bundesliga', 'Alemão'] },
  { name: 'Serie A', keywords: ['Juventus', 'Milan', 'Inter de Milão', 'Inter Milan', 'Roma', 'Serie A Itália', 'Italiano'] },
  { name: 'Ligue 1', keywords: ['PSG', 'Paris Saint Germain', 'Ligue 1', 'Francês'] },
  { name: 'Internacional', keywords: ['Seleção', 'Brasil', 'Argentina', 'França', 'Alemanha', 'Itália', 'Inglaterra', 'Espanha', 'Portugal', 'Uruguai', 'Colômbia', 'Bélgica', 'Japão', 'Copa do Mundo', 'Eurocopa'] }
];

function cleanSlug(slug: string): string {
  if (!slug) return '';
  return decodeURIComponent(slug)
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Import all products from a Shopify store or collection JSON endpoint.
 */
export async function importProductsFromUrl(startUrl: string): Promise<Product[]> {
  try {
    const urlObj = new URL(startUrl);
    let allProducts: any[] = [];
    
    // Check if it's a single product URL (e.g. /products/{handle})
    const isSingleProduct = urlObj.pathname.includes('/products/') && !urlObj.pathname.includes('/collections/');
    
    if (isSingleProduct) {
      // Extract single product handle
      const match = urlObj.pathname.match(/\/products\/([^/]+)/);
      if (match && match[1]) {
        const handle = match[1].replace(/\.json$/, '');
        const jsonUrl = `${urlObj.origin}/products/${handle}.json`;
        const response = await fetch(jsonUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch product details: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.product) {
          allProducts = [data.product];
        }
      }
    } else {
      // Collection, tag, or homepage import
      let jsonUrl = '';
      
      // Match tag collection like /collections/collection-slug/tag-slug
      const tagMatch = urlObj.pathname.match(/\/collections\/([^/]+)\/([^/]+)/);
      const collectionMatch = urlObj.pathname.match(/\/collections\/([^/]+)/);
      
      if (tagMatch && tagMatch[1] && tagMatch[2]) {
        jsonUrl = `${urlObj.origin}/collections/${tagMatch[1]}/${tagMatch[2]}/products.json`;
      } else if (collectionMatch && collectionMatch[1]) {
        jsonUrl = `${urlObj.origin}/collections/${collectionMatch[1]}/products.json`;
      } else {
        jsonUrl = `${urlObj.origin}/products.json`;
      }
      
      // Paginated fetch of all products (limit to 10 pages / 2500 products)
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 10) {
        const separator = jsonUrl.includes('?') ? '&' : '?';
        const pageUrl = `${jsonUrl}${separator}limit=250&page=${page}`;
        const response = await fetch(pageUrl);
        if (!response.ok) {
          if (page === 1) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
          }
          break;
        }
        const data = await response.json();
        const productsPage = data.products;
        if (!productsPage || !Array.isArray(productsPage) || productsPage.length === 0) {
          hasMore = false;
        } else {
          allProducts = [...allProducts, ...productsPage];
          if (productsPage.length < 250) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }
    }

    // Apply client-side search query filtering if query parameter 'q' or 'query' is present
    const searchQuery = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
    if (searchQuery && allProducts.length > 0) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      allProducts = allProducts.filter(p => {
        const titleMatch = p.title && p.title.toLowerCase().includes(lowerQuery);
        const descMatch = p.body_html && p.body_html.toLowerCase().includes(lowerQuery);
        const typeMatch = p.product_type && p.product_type.toLowerCase().includes(lowerQuery);
        const vendorMatch = p.vendor && p.vendor.toLowerCase().includes(lowerQuery);
        const tagMatch = p.tags && (
          Array.isArray(p.tags) 
            ? p.tags.some((t: string) => t.toLowerCase().includes(lowerQuery))
            : typeof p.tags === 'string' && p.tags.toLowerCase().includes(lowerQuery)
        );
        return titleMatch || descMatch || typeMatch || vendorMatch || tagMatch;
      });
    }

    // Map Shopify products to our Product type
    const products: Product[] = allProducts.map((p: any) => {
      const image = p.images && p.images.length > 0 ? p.images[0].src : '';
      const images = p.images ? p.images.map((img: any) => img.src) : [];

      const price = p.variants && p.variants.length > 0 ? parseFloat(p.variants[0].price) : 0;
      const originalPrice = p.variants && p.variants.length > 0 && p.variants[0].compare_at_price 
        ? parseFloat(p.variants[0].compare_at_price) 
        : 0;

      const sizes = Array.from(new Set(
        p.variants
          ? p.variants
              .map((v: any) => v.title)
              .filter((title: string) => title && title.toLowerCase() !== 'default title')
          : []
      )) as string[];

      const sizeStock: { [key: string]: number } = {};
      sizes.forEach(size => {
        sizeStock[size] = 10;
      });

      // Smart inference of team, league, category
      let inferredTeam = 'Importado';
      let inferredLeague = 'Generic';
      let inferredCategory = 'Imported';

      // 1. Infer Category from collection URL slug, or product type, or default
      if (urlObj.pathname.includes('/collections/')) {
        const collectionMatch = urlObj.pathname.match(/\/collections\/([^/]+)/);
        if (collectionMatch && collectionMatch[1]) {
          inferredCategory = cleanSlug(collectionMatch[1]);
        }
      } else if (p.product_type) {
        inferredCategory = p.product_type;
      }

      // 2. Infer Team by checking title, tags, description, or collection slug
      const titleLower = (p.title || '').toLowerCase();
      const tagsList: string[] = Array.isArray(p.tags) 
        ? p.tags.map((t: any) => String(t).toLowerCase())
        : typeof p.tags === 'string'
          ? p.tags.split(',').map((t: string) => t.trim().toLowerCase())
          : [];
      
      const titleNorm = normalizeText(p.title || '');
      const tagsNorm = tagsList.map(t => normalizeText(t));

      const matchedTeam = TEAMS.find(t => {
        const tNorm = normalizeText(t);
        return titleNorm.includes(tNorm) || 
               tagsNorm.includes(tNorm) || 
               tagsNorm.some(tag => tag.includes(tNorm));
      });

      if (matchedTeam) {
        inferredTeam = matchedTeam;
      } else if (urlObj.pathname.includes('/collections/')) {
        const collectionMatch = urlObj.pathname.match(/\/collections\/([^/]+)/);
        if (collectionMatch && collectionMatch[1]) {
          const collClean = cleanSlug(collectionMatch[1]);
          const matchedCollTeam = TEAMS.find(t => normalizeText(t) === normalizeText(collClean));
          if (matchedCollTeam) {
            inferredTeam = matchedCollTeam;
          }
        }
      }

      // 3. Infer League based on inferred team or keywords in title/tags
      const matchedLeague = LEAGUES.find(league => {
        if (inferredTeam !== 'Importado' && league.keywords.some(k => normalizeText(k) === normalizeText(inferredTeam))) {
          return true;
        }
        return league.keywords.some(k => titleNorm.includes(normalizeText(k)) || tagsNorm.includes(normalizeText(k)));
      });

      if (matchedLeague) {
        inferredLeague = matchedLeague.name;
      }

      return {
        id: p.id ? String(p.id) : uuidv4(),
        name: p.title || '',
        team: inferredTeam,
        league: inferredLeague,
        price: price,
        originalPrice: originalPrice > 0 ? originalPrice : undefined,
        image: image,
        images: images,
        description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '') : '',
        category: inferredCategory,
        sizes: sizes.length > 0 ? sizes : ['P', 'M', 'G', 'GG'],
        sizeStock: sizes.length > 0 ? sizeStock : { 'P': 10, 'M': 10, 'G': 10, 'GG': 10 },
        stock: sizes.length > 0 ? sizes.length * 10 : 40,
        active: true
      };
    });

    return products;
  } catch (err) {
    console.error('Error importing from Shopify URL', startUrl, err);
    return [];
  }
}

