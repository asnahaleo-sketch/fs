import express from 'express';

const router = express.Router();

// ─── Shopify Store Config ─────────────────────────────────────────────────────
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '4cm1ia-0e.myshopify.com';
const MCP_ENDPOINT = `https://${SHOP_DOMAIN}/api/mcp`;

// ─── Product Catalog (Synced with your real Stratos store) ───────────────────
const CATALOG = [
  {
    id: 'stratos-apex',
    handle: 'stratos-apex',
    title: 'Stratos Apex',
    price: '350.00',
    description: 'THE PINNACLE. Iridescent Chroma-Shift upper, Carbon Fiber Shank, aerospace-grade cushioning. The most elite shoe we make.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-apex`,
    tags: ['elite', 'expensive', 'premium', 'carbon', 'apex', 'top', 'best', 'luxury', 'most'],
    ageGroup: 'adult',
  },
  {
    id: 'stratos-zenith',
    handle: 'stratos-zenith',
    title: 'Stratos Zenith',
    price: '320.00',
    description: 'Luxury edition with real gold-thread stitching and premium cloud-leather. Status footwear redefined.',
    image: 'https://images.unsplash.com/photo-1551107105-a28249a26540?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-zenith`,
    tags: ['luxury', 'gold', 'premium', 'expensive', 'zenith', 'fashion'],
    ageGroup: 'adult',
  },
  {
    id: 'stratos-aether-ii',
    handle: 'stratos-aether-ii',
    title: 'Stratos Aether II',
    price: '310.00',
    description: 'The legend. Zero-G sole unit with Bioluminescent heel tabs. Ultralight performance meets iconic design.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aether-ii`,
    tags: ['zero-g', 'legend', 'aether', 'performance', 'light', 'bioluminescent'],
    ageGroup: 'adult',
  },
  {
    id: 'stratos-cloudrunner',
    handle: 'stratos-cloudrunner',
    title: 'Stratos CloudRunner',
    price: '289.00',
    description: 'High-comfort urban explorer with Cloud-Foam midsole. Ideal for active kids and casual adults alike.',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-cloudrunner`,
    tags: ['comfort', 'cloud', 'foam', 'running', 'urban', 'kid', 'child', 'youth', 'casual', 'active'],
    ageGroup: 'all',
  },
  {
    id: 'stratos-aero',
    handle: 'stratos-aero',
    title: 'Stratos Aero',
    price: '289.00',
    description: 'Speed-focused aerodynamic profile. Lightweight build, aggressive grip — born for performance and fun.',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-aero`,
    tags: ['speed', 'aero', 'fast', 'aerodynamic', 'kid', 'child', 'youth', 'sport', 'performance', 'fun'],
    ageGroup: 'all',
  },
  {
    id: 'stratos-void',
    handle: 'stratos-void',
    title: 'Stratos Void',
    price: '199.00',
    description: 'Minimalist, matte black, silent-step sole. Clean and versatile — the everyday essential.',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
    link: `https://${SHOP_DOMAIN}/products/stratos-void`,
    tags: ['minimalist', 'black', 'void', 'everyday', 'clean', 'simple', 'casual', 'budget', 'affordable'],
    ageGroup: 'all',
  },
];

// ─── Context Extraction (Age, Recipient, Budget) ─────────────────────────────
function extractContext(msg) {
  const q = msg.toLowerCase();
  const context = { age: null, recipient: 'friend', budget: null };

  // Extract Age: "10 year old", "8-year", "12y"
  const ageMatch = q.match(/(\d{1,2})\s*-?\s*(year|yr|y)/);
  if (ageMatch) context.age = ageMatch[1];

  // Extract Recipient: "cousin", "son", "daughter", "nephew", "niece"
  const recpMatch = q.match(/cousin|son|daughter|nephew|niece|kid|child|brother|sister|grandson|granddaughter/);
  if (recpMatch) context.recipient = recpMatch[0];

  // Extract Budget: "under $200", "below 250", "max 300"
  const budgetMatch = q.match(/(under|below|max|up to|less than)\s*\$?\s*(\d{2,4})/);
  if (budgetMatch) context.budget = parseInt(budgetMatch[2]);

  return context;
}

// ─── Intent Classifier ────────────────────────────────────────────────────────
function classifyIntent(msg) {
  const q = msg.toLowerCase();

  // Greeting / capabilities
  if (q.match(/^(hi|hello|hey|sup|yo|what can you|help me|what do you do|capabilities)/)) return 'greet';

  // Most expensive / elite / flagship
  if (q.match(/most expensive|priciest|highest price|elite|flagship|best shoe|top shoe|pinnacle|luxury/)) return 'most_expensive';

  // Budget / cheapest
  if (q.match(/cheap|affordable|budget|lowest price|entry.?level|most affordable|least expensive/)) return 'cheapest';

  // Gift for child / kid / person
  if (q.match(/kid|child|children|(\d{1,2})\s*-?year|youth|junior|nephew|niece|son|daughter|cousin|for a (boy|girl)|young|gift|present/)) return 'gift_child';

  // Gift / buying advice
  if (q.match(/recommend|suggest|advise|buying decision|which (shoe|one)|what should|help me (pick|choose|find)/)) return 'recommend';

  // Policy / shipping / returns
  if (q.match(/return|refund|shipping|warranty|policy|guarantee|exchange|delivery|how long/)) return 'policy';

  // Cart / buy now
  if (q.match(/add to cart|buy now|purchase|checkout|order now|place order/)) return 'cart';

  // Specific product name
  for (const product of CATALOG) {
    if (q.includes(product.handle) || q.includes(product.title.toLowerCase())) return `product:${product.id}`;
  }

  // Keyword search
  return 'search';
}

// ─── Scoring product relevance ────────────────────────────────────────────────
function scoreProducts(query) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);

  return CATALOG
    .map(p => {
      let score = 0;
      for (const word of words) {
        if (p.tags.some(tag => tag.includes(word) || word.includes(tag))) score += 3;
        if (p.title.toLowerCase().includes(word)) score += 5;
        if (p.description.toLowerCase().includes(word)) score += 1;
      }
      return { ...p, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ─── MCP Adapter (async, best-effort only) ────────────────────────────────────
async function tryMcpSearch(query) {
  try {
    const res = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: Date.now(), method: 'tools/call',
        params: {
          name: 'search_shop_catalog',
          arguments: { query, context: `Stratos storefront customer asking: ${query}` },
        },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const textContent = data?.result?.content?.filter(c => c.type === 'text').map(c => c.text).join('\n');
    if (!textContent) return null;

    // Try JSON parse first
    try {
      const parsed = JSON.parse(textContent);
      const list = parsed.products || (Array.isArray(parsed) ? parsed : null);
      if (list && list.length > 0) {
        return list.map(p => ({
          id: p.variantId || p.id || p.handle,
          title: p.title || p.name || 'Product',
          price: (p.price?.amount || p.price || '0').toString(),
          description: p.description || '',
          image: p.imageUrl || p.image || '',
          link: p.url || `https://${SHOP_DOMAIN}/products/${p.handle || ''}`,
        })).filter(p => p.title !== 'Product');
      }
    } catch (_) {}

    // Text is a markdown table or prose — extract price/title pairs if possible
    const lines = textContent.split('\n').filter(l => l.trim());
    const extracted = [];
    for (const line of lines) {
      const priceMatch = line.match(/\$(\d+\.?\d*)/);
      const titleMatch = line.match(/\*\*(.*?)\*\*/);
      if (priceMatch && titleMatch) {
        extracted.push({ id: titleMatch[1], title: titleMatch[1], price: priceMatch[1], description: line.replace(/\*\*/g, ''), image: '', link: '' });
      }
    }
    return extracted.length > 0 ? extracted : null;
  } catch (_) {
    return null;
  }
}

// ─── Polyfill: merge MCP results into catalog (prefer catalog for images/links) ──
function mergeMcpWithCatalog(mcpProducts) {
  if (!mcpProducts || mcpProducts.length === 0) return [];
  return mcpProducts.map(mp => {
    const local = CATALOG.find(c =>
      c.title.toLowerCase().includes(mp.title.toLowerCase()) ||
      mp.title.toLowerCase().includes(c.title.toLowerCase())
    );
    if (local) return { ...local, price: mp.price || local.price };
    return { ...mp, image: mp.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' };
  });
}

// ─── Chat Route ───────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, cartId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const intent = classifyIntent(message);
    console.log(`[Chat] Incoming: "${message}" | Intent: ${intent} | Cart: ${cartId || 'None'}`);
    
    let reply = '';
    let products = [];
    let newCartId = cartId || null;
    let checkoutUrl = null;

    // ── GREETING / CAPABILITIES ───────────────────────────────────────────────
    if (intent === 'greet') {
      reply = `Welcome to the **Stratos Elite Intelligence Unit** — your personal shopping concierge for the world's most advanced footwear.\n\nHere's what I can help with:\n\n🏆 **"Show me your most expensive shoe"**\n👟 **"Recommend a shoe for my 8-year-old cousin"**\n💡 **"I need a gift for a sports-lover"**\n🔍 **"Tell me about the Stratos Apex"**\n📦 **"What's your return policy?"**\n\nWhat are you looking for today?`;

    // ── MOST EXPENSIVE ────────────────────────────────────────────────────────
    } else if (intent === 'most_expensive') {
      const sorted = [...CATALOG].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      products = sorted.slice(0, 3);
      reply = `🏆 Our most prestigious piece is the **Stratos Apex** at **$350.00** — Iridescent Chroma-Shift upper, Carbon Fiber Shank, and zero-compromise construction. It is the pinnacle of what we make.\n\nHere are our **top 3 premium picks** for you:`;

    // ── CHEAPEST ─────────────────────────────────────────────────────────────
    } else if (intent === 'cheapest') {
      const sorted = [...CATALOG].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      products = sorted.slice(0, 3);
      reply = `Our most accessible option is the **Stratos Void** at **$199.00** — a clean, minimalist matte-black everyday shoe that punches above its price point. Here are our best value picks:`;

    // ── GIFT FOR CHILD / RECIPIENT ──────────────────────────────────────────
    } else if (intent === 'gift_child') {
      const ctx = extractContext(message);
      let youthPicks = CATALOG.filter(p => p.ageGroup === 'all');
      
      // Filter by budget if provided
      if (ctx.budget) {
        youthPicks = youthPicks.filter(p => parseFloat(p.price) <= ctx.budget);
      }
      
      products = youthPicks;
      
      const person = ctx.recipient.charAt(0).toUpperCase() + ctx.recipient.slice(1);
      const ageStr = ctx.age ? `${ctx.age}-year-old` : 'young';
      const budgetStr = ctx.budget ? ` for under $${ctx.budget}` : '';

      reply = `Great choice! 👟 For your **${ageStr} ${person}**${budgetStr}, I recommend looking at **US Youth sizes (4Y–6Y)**.\n\nOur top picks for active kids:\n\n- **Stratos CloudRunner** — Cloud-Foam midsole, forgiving and ultra-comfortable for all-day wear.\n- **Stratos Aero** — Lightweight, aerodynamic, and fun. Perfect for kids who love to run.\n- **Stratos Void** — Clean black silhouette if they prefer a low-key stylish look.\n\nAll three are available in youth sizing. Would you like to know more about any of these?`;

    // ── RECOMMENDATION / BUYING DECISION ─────────────────────────────────────
    } else if (intent === 'recommend') {
      const q = message.toLowerCase();
      const ctx = extractContext(message);
      let recommendPicks = CATALOG;

      // Filter by budget if provided
      if (ctx.budget) {
        recommendPicks = recommendPicks.filter(p => parseFloat(p.price) <= ctx.budget);
      }

      // Determine sub-type
      if (q.match(/sport|running|run|fast|performance/)) {
        products = recommendPicks.filter(p => ['stratos-aero', 'stratos-aether-ii', 'stratos-cloudrunner'].includes(p.id));
        reply = `For performance and sport${ctx.budget ? ` under $${ctx.budget}` : ''}, here are my top recommendations:`;
      } else if (q.match(/style|fashion|casual|streetwear|look/)) {
        products = recommendPicks.filter(p => ['stratos-apex', 'stratos-zenith', 'stratos-void'].includes(p.id));
        reply = `For style and fashion-forward looks${ctx.budget ? ` under $${ctx.budget}` : ''}, these are my picks:`;
      } else {
        // General recommendation — show all filtered by budget
        products = recommendPicks.slice(0, 3);
        const budgetStr = ctx.budget ? ` for under $${ctx.budget}` : '';
        reply = `I'd love to help you choose${budgetStr}! To give you the best recommendation, could you tell me:\n\n1. **Who is it for?** (age, gender, style)\n2. **What's the occasion?** (everyday, sport, gift)\n3. **Budget range?** (we go from $199 to $350)\n\nIn the meantime, here are our most popular picks:`;
      }

    // ── POLICY ────────────────────────────────────────────────────────────────
    } else if (intent === 'policy') {
      // Try MCP for real policy data
      try {
        const res = await fetch(MCP_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: Date.now(), method: 'tools/call',
            params: { name: 'search_shop_policies_and_faqs', arguments: { query: message } },
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.result?.content?.filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
          if (text && text.length > 20) {
            reply = text;
          } else {
            throw new Error('Empty policy response');
          }
        } else {
          throw new Error('MCP policy unavailable');
        }
      } catch (_) {
        reply = `Our standard policies:\n\n📦 **Shipping**: Free standard shipping on all orders. Express (2-3 days) available.\n🔄 **Returns**: 30-day hassle-free returns on unworn items in original packaging.\n🛡️ **Warranty**: All Stratos footwear comes with a 12-month manufacturing warranty.\n💳 **Payment**: We accept all major cards, Apple Pay, and Google Pay.\n\nFor any specific inquiries, visit our store directly.`;
      }

    // ── SPECIFIC PRODUCT ──────────────────────────────────────────────────────
    } else if (intent.startsWith('product:')) {
      const productId = intent.split(':')[1];
      const product = CATALOG.find(p => p.id === productId);
      if (product) {
        products = [product];
        reply = `Here's everything about the **${product.title}**:\n\n${product.description}\n\n💰 Price: **$${product.price}**\n\nWould you like to know about sizing, or shall I add it to your cart?`;
      }

    // ── DEFAULT SEARCH ────────────────────────────────────────────────────────
    } else {
      // Try MCP first for live data
      const mcpResults = await tryMcpSearch(message);
      if (mcpResults && mcpResults.length > 0) {
        products = mergeMcpWithCatalog(mcpResults).slice(0, 4);
        reply = `I found **${products.length}** product${products.length > 1 ? 's' : ''} in the Stratos live catalog for you:`;
      } else {
        // Fall back to smart local scoring
        const scored = scoreProducts(message);
        if (scored.length > 0) {
          products = scored.slice(0, 3);
          reply = `Here are the closest matches from the Stratos catalog for **"${message}"**:`;
        } else {
          // Show all
          products = CATALOG.slice(0, 3);
          reply = `I couldn't find an exact match for **"${message}"** — but here are some of our bestsellers you might love. You can also try:\n\n- *"Show me the most expensive shoe"*\n- *"Recommend something for a kid"*\n- *"Tell me about the Stratos Apex"*`;
        }
      }
    }

    res.json({
      reply,
      products: products.slice(0, 4),
      cartId: newCartId,
      checkoutUrl,
      source: 'stratos-concierge-mcp',
      store: SHOP_DOMAIN,
    });

  } catch (err) {
    console.error('[Chat] Endpoint error:', err);
    res.status(500).json({ error: 'Failed to process chat request', details: err.message });
  }
});

export default router;
