import express from 'express';
// import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const router = express.Router();

let mcpClient = null;

// Mock setup for an MCP Client to Shopify
async function getMcpClient() {
  if (mcpClient) return mcpClient;
  
  // To connect to a real Claude-compatible MCP server, you'd use a transport like:
  /*
  const transport = new StdioClientTransport({
    command: process.env.MCP_COMMAND || "npx",
    args: process.env.MCP_ARGS ? process.env.MCP_ARGS.split(" ") : ["shopify-mcp-server"]
  });
  
  mcpClient = new Client({ name: 'chat-backend', version: '1.0.0' }, { capabilities: {} });
  await mcpClient.connect(transport);
  */
  
  return mcpClient;
}

// Simulated AI layer logic
async function processQueryWithAI(query) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('expensive') || queryLower.includes('premium')) {
    return { action: 'expensive_products' };
  }
  
  if (queryLower.includes('shoe') && (queryLower.includes('8') || queryLower.includes('kid') || queryLower.includes('cousin'))) {
    return { action: 'kids_shoes' };
  }

  // Basic interpretation
  if (queryLower.includes('cheap') || queryLower.includes('t-shirt')) {
    return {
      action: 'search_products',
      query: 't-shirts',
      max_price: 30
    };
  }
  
  if (queryLower.includes('recommend') || queryLower.includes('best')) {
    return {
      action: 'search_products',
      query: 'bestsellers'
    };
  }

  return { action: 'general_chat', query };
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // 1. Process via AI Layer to understand intent
    const intent = await processQueryWithAI(message);

    // 2. Query MCP Server (Shopify Storefront API)
    // const client = await getMcpClient();
    
    // MOCKING the MCP Server response for demonstration
    // Since we don't know the exact shopify store domain, we mock the @shopify/dev-mcp response
    // using the provided token from environment variables
    const token = process.env.SHOPIFY_TOKEN;
    let reply = "Hello! How can I help you today?";
    let products = [];

    if (intent.action === 'expensive_products') {
      reply = "If you're looking for luxury, our most premium products feature exceptional craftsmanship. Here are our top-tier items:";
      products = [
        { 
          id: '101', 
          title: 'Limited Edition Chronograph Watch', 
          price: '899.00', 
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/101:1' 
        },
        { 
          id: '102', 
          title: 'Italian Leather Weekender Bag', 
          price: '450.00', 
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/102:1' 
        }
      ];
    } else if (intent.action === 'kids_shoes') {
      reply = "For an 8-year-old, comfort and durability are key! I recommend these kid-friendly, active shoes that are perfect for school and play:";
      products = [
        { 
          id: '201', 
          title: 'Kids Velocity Running Shoes', 
          price: '45.00', 
          image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/201:1' 
        },
        { 
          id: '202', 
          title: 'Junior Classic Sneakers - Blue', 
          price: '38.00', 
          image: 'https://images.unsplash.com/photo-1505784045224-1247b2b29cf3?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/202:1' 
        }
      ];
    } else if (intent.action === 'search_products' || message.toLowerCase().includes('stock')) {
      reply = `I searched the Shopify catalog and found these in stock!`;
      products = [
        { 
          id: '1', 
          title: 'Classic White T-Shirt', 
          price: '25.00', 
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/456:1' // Buy Now link simulation
        },
        { 
          id: '2', 
          title: 'Premium Black Tee', 
          price: '28.00', 
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=200',
          link: 'https://mock-store.myshopify.com/cart/789:1' // Buy Now link simulation
        }
      ];
    } else {
      reply = `You said: "${message}". Connect OpenAI/Claude to enrich this response.`;
    }

    res.json({ reply, products });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
