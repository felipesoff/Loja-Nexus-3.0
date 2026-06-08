import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Import all products from a Shopify store or collection JSON endpoint.
 */
export async function importProductsFromUrl(startUrl: string): Promise<Product[]> {
  try {
    // Parse the input URL to get the base domain and check if there's a collection slug
    const urlObj = new URL(startUrl);
    let jsonUrl = '';

    if (urlObj.pathname.includes('/collections/')) {
      // Extract the collection slug
      const match = urlObj.pathname.match(/\/collections\/([^/]+)/);
      if (match && match[1]) {
        jsonUrl = `${urlObj.origin}/collections/${match[1]}/products.json`;
      }
    }

    if (!jsonUrl) {
      // Fallback to the default products.json of the store
      jsonUrl = `${urlObj.origin}/products.json`;
    }

    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch products from Shopify store: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Invalid Shopify products JSON response');
    }

    // Map Shopify products to our Product type
    const products: Product[] = data.products.map((p: any) => {
      // Find the first image if available
      const image = p.images && p.images.length > 0 ? p.images[0].src : '';
      const images = p.images ? p.images.map((img: any) => img.src) : [];

      // Parse price from variants (Shopify prices are strings)
      const price = p.variants && p.variants.length > 0 ? parseFloat(p.variants[0].price) : 0;

      // Extract unique sizes from variants
      const sizes = Array.from(new Set(
        p.variants
          ? p.variants
              .map((v: any) => v.title)
              .filter((title: string) => title && title.toLowerCase() !== 'default title')
          : []
      )) as string[];

      // Build size stock map
      const sizeStock: { [key: string]: number } = {};
      sizes.forEach(size => {
        sizeStock[size] = 10; // Default stock level
      });

      return {
        id: uuidv4(),
        name: p.title || '',
        team: 'Importado',
        league: 'Generic',
        price: price,
        image: image,
        images: images,
        description: p.body_html ? p.body_html.replace(/<[^>]*>/g, '') : '', // strip HTML tags for clean text description
        category: 'Imported',
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
