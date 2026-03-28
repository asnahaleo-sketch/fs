// src/shopifyLogic.ts

/**
 * CONFIGURATION: Update these values with your Shopify Storefront API credentials.
 */
const SHOP_DOMAIN = '4cm1ia-0e.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = 'PASTE_YOUR_STOREFRONT_TOKEN_HERE';

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
    id: 'store-aero',
    title: 'Stratos Aero',
    handle: 'stratos-aero',
    description: 'Ultra-lightweight racer with holographic accents. A flagship model in our collection.',
    price: '135.00', // Real Price from your store HTML
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aero`,
    tags: ['shoes', 'best-seller', 'aero']
  },
  {
    id: 'store-aether-2',
    title: 'Stratos Aether II',
    handle: 'stratos-aether-ii',
    description: 'Premium cushioning and iridescent panels. Evolution of the classic Aether design.',
    price: '289.00', // Real Price from your store HTML
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aether-ii`,
    tags: ['shoes', 'premium', 'high-performance']
  },
  {
    id: 'store-apex',
    title: 'Stratos Apex',
    handle: 'stratos-apex',
    description: 'Gold-accented luxury trainer. Engineered for maximum stability and street style.',
    price: '299.00', // Real Price from your store HTML
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-apex`,
    tags: ['shoes', 'premium', 'luxury']
  },
  {
    id: 'store-zenith',
    title: 'Stratos Zenith',
    handle: 'stratos-zenith',
    description: 'The pinnacle of the Stratos line. Featuring our most advanced sole technology.',
    price: '310.00', // Real Price from your store HTML
    image: 'https://images.unsplash.com/photo-1551107105-a28249a26540?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-zenith`,
    tags: ['shoes', 'premium', 'best-seller']
  }
];

function handleSmartSimulation(query: string) {
  const q = query.toLowerCase();
  
  // 1. General greeting
  if (q.includes('hello') || q.includes('hi')) {
    return { 
      reply: `Welcome to **${SHOP_DOMAIN}**. I'm here to help you find the perfect pair of shoes, like the **Stratos Aero** or **Apex**. What's your style?`, 
      products: [] 
    };
  }

  // 2. Collection Filters
  if (q.includes('best') || q.includes('top') || q.includes('popular')) {
    const matched = MOCK_DB.filter(p => p.tags?.includes('best-seller'));
    return {
      reply: `Here are the top-trending pairs from the **Stratos** collection:`,
      products: matched
    };
  }

  if (q.includes('premium') || q.includes('luxury') || q.includes('high-end')) {
    const matched = MOCK_DB.filter(p => p.tags?.includes('premium'));
    return {
      reply: `Discover our **Stratos Premium** footwear. Engineered for elite performance and style:`,
      products: matched
    };
  }

  // 3. Smart Search (Stratos collection priority)
  const keywords = q.split(' ').filter(word => word.length > 2);
  const matched = MOCK_DB.filter(p => 
    keywords.some(k => p.title.toLowerCase().includes(k) || p.description.toLowerCase().includes(k)) ||
    (q.includes('shoe') || q.includes('sneaker') || q.includes('stratos') || q.includes('product')) 
  );

  if (matched.length > 0) {
    return {
      reply: `I found these products on **${SHOP_DOMAIN}** for you:`,
      products: matched.slice(0, 3)
    };
  }

  // 4. Fallback
  return {
    reply: `I couldn't find an exact match for that, but you can explore the full **Stratos** line on our homepage.`,
    products: MOCK_DB.slice(0, 2)
  };
}
