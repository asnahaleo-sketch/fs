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

    if (intent.action === 'search_products' || message.toLowerCase().includes('stock')) {
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
