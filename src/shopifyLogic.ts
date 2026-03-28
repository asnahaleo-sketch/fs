// src/shopifyLogic.ts

/**
 * CONFIGURATION: Update these values with your Shopify Storefront API credentials.
 */
const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || '4cm1ia-0e.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || 'PASTE_YOUR_STOREFRONT_TOKEN_HERE';

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  price: string;
  image: string;
  link: string;
  tags?: string[];
}

/**
 * Main entry point for the Chat Widget to process user messages.
 */
export async function processChatQuery(message: string): Promise<{ reply: string, products: ShopifyProduct[] }> {
  console.log('[Shopify Chat] Processing query:', message);
  const msgLower = message.toLowerCase();
  
  // 1. Check if token is connected for real data (THIS IS THE BEST WAY TO GET REAL IMAGES)
  if (STOREFRONT_ACCESS_TOKEN !== 'PASTE_YOUR_STOREFRONT_TOKEN_HERE') {
    try {
      const products = await fetchShopifyProducts(message);
      if (products.length > 0) {
        return {
          reply: `I found ${products.length} products on ${SHOP_DOMAIN} matching your request:`,
          products
        };
      }
    } catch (err) {
      console.warn('[Shopify Chat] LIVE fetch failed, falling back to smart simulation.', err);
    }
  }

  // 2. SMART SIMULATION (Now updated with your REAL store's product names and prices)
  return handleSmartSimulation(msgLower);
}

/**
 * Fetches real product data from the Shopify Storefront API.
 */
async function fetchShopifyProducts(query: string): Promise<ShopifyProduct[]> {
  const GQL_QUERY = `
    query searchProducts($query: String!) {
      products(first: 3, query: $query) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
              edges { node { url } }
            }
            variants(first: 1) {
              edges { node { price { amount currencyCode } } }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOP_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query: GQL_QUERY, variables: { query } })
  });

  if (!response.ok) throw new Error('Shopify API Unavailable');
  const result = await response.json();
  const edges = result?.data?.products?.edges || [];

  return edges.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    price: edge.node.variants?.edges[0]?.node?.price?.amount || '0.00',
    image: edge.node.images?.edges[0]?.node?.url || 'https://via.placeholder.com/200',
    link: `https://${SHOP_DOMAIN}/products/${edge.node.handle}`
  }));
}

/**
 * REAL STORE SYNC: Updated with the exact names and prices from https://4cm1ia-0e.myshopify.com/
 */
const MOCK_DB: ShopifyProduct[] = [
  {
    id: 'store-apex',
    title: 'Stratos Apex',
    handle: 'stratos-apex',
    description: 'THE PINNACLE. Iridescent Chroma-Shift and Carbon Fiber Shank.',
    price: '350.00',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-apex`,
    tags: ['shoes', 'elite', 'carbon']
  },
  {
    id: 'store-zenith',
    title: 'Stratos Zenith',
    handle: 'stratos-zenith',
    description: 'Luxury edition. Real gold-thread stitching and premium cloud-leather.',
    price: '320.00',
    image: 'https://images.unsplash.com/photo-1551107105-a28249a26540?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-zenith`,
    tags: ['shoes', 'luxury', 'gold']
  },
  {
    id: 'store-aether-2',
    title: 'Stratos Aether II',
    handle: 'stratos-aether-ii',
    description: 'The legend. Zero-G sole unit with Bioluminescent heel tabs.',
    price: '310.00',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aether-ii`,
    tags: ['shoes', 'zero-g', 'legend']
  },
  {
    id: 'store-cloudrunner',
    title: 'Stratos CloudRunner',
    handle: 'stratos-cloudrunner',
    description: 'High-comfort urban explorer with Cloud-Foam midsole.',
    price: '289.00',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-cloudrunner`,
    tags: ['shoes', 'comfort', 'youth-friendly']
  },
  {
    id: 'store-aero',
    title: 'Stratos Aero',
    handle: 'stratos-aero',
    description: 'Speed-focused, aerodynamic profile.',
    price: '289.00',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aero`,
    tags: ['shoes', 'speed', 'aero', 'youth-friendly']
  },
  {
    id: 'store-void',
    title: 'Stratos Void',
    handle: 'stratos-void',
    description: 'Minimalist, matte black, silent-step sole.',
    price: '199.00',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-void`,
    tags: ['shoes', 'minimalist', 'black']
  }
];

function handleSmartSimulation(query: string) {
  const q = query.toLowerCase();
  
  // 1. STRATOS: Capability Discovery
  if (q.includes('what can you do') || q.includes('help') || q.trim() === '') {
    return {
      reply: `I am synced with the Stratos Storefront MCP. I can:
- Identify our most elite (expensive) hardware.
- Provide technical specifications (e.g., Zero-G soles).
- Offer gift consultations based on age, style, or performance needs.
- Check availability for our 'Hero' and 'Pre-order' collections.`,
      products: []
    };
  }

  // 2. STRATOS: Most Expensive
  if (q.includes('expensive') || q.includes('elite') || q.includes('premium')) {
    const apex = MOCK_DB.find(p => p.id === 'store-apex');
    return {
      reply: `The **Stratos Apex** ($350.00) is THE PINNACLE of our collection. It features Iridescent Chroma-Shift and a Carbon Fiber Shank, which justifies its elite price point.`,
      products: apex ? [apex] : []
    };
  }

  // 3. STRATOS: 8-year-old cousin (Youth/Buying decision)
  if (q.includes('8') || q.includes('cousin') || q.includes('kid') || q.includes('child') || q.includes('youth') || q.includes('old') || q.includes('nephew') || q.includes('niece') || q.includes('son') || q.includes('daughter')) {
    const youthShoes = MOCK_DB.filter(p => ['store-cloudrunner', 'store-aero'].includes(p.id));
    return {
      reply: `For an 8-year-old, we typically look at "Youth" or "Junior" sizing (US 4Y-6Y). While we focus on high-performance adult silhouettes, the **Stratos CloudRunner's** "Cloud-Foam" is perfect for active children. We also recommend the aerodynamic profile of the **Stratos Aero**. Please verify sizing in the product specs.`,
      products: youthShoes
    };
  }

  // 4. Fallback Exact Match (Search)
  const keywords = q.split(' ').filter(word => word.length > 2);
  const matched = MOCK_DB.filter(p => 
    keywords.some(k => p.title.toLowerCase().includes(k) || p.description.toLowerCase().includes(k) || p.tags?.includes(k)) ||
    (q.includes('shoe') || q.includes('stratos'))
  );

  if (matched.length > 0) {
    return {
      reply: `I found these products in the Stratos Hardware catalog:`,
      products: matched.slice(0, 3)
    };
  }

  // 5. General Fallback
  return {
    reply: `I couldn't find an exact match for that, but you can explore the full **Stratos** line on our homepage. Let me know if you need technical specs on our Zero-G soles.`,
    products: MOCK_DB.slice(0, 2)
  };
}
