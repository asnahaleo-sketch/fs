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
  
  if (queryLower.includes('expensive') || queryLower.includes('elite') || queryLower.includes('apex')) {
    return { action: 'stratos_expensive' };
  }
  
  if (queryLower.includes('8') || queryLower.includes('cousin') || queryLower.includes('youth') || queryLower.includes('child')) {
    return { action: 'stratos_youth' };
  }

  return { action: 'stratos_capabilities', query };
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

    if (intent.action === 'stratos_expensive') {
      reply = "The Stratos Apex ($350.00) is THE PINNACLE of our collection. It features Iridescent Chroma-Shift and a Carbon Fiber Shank, which justifies its elite price point.";
      products = [
        { 
          id: 'stratos-apex', 
          title: 'Stratos Apex', 
          price: '350.00', 
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',
          link: '/products/stratos-apex' 
        }
      ];
    } else if (intent.action === 'stratos_youth') {
      reply = "For an 8-year-old, we typically look at 'Youth' or 'Junior' sizing (US 4Y-6Y). While we focus on high-performance adult silhouettes, the Stratos CloudRunner's 'Cloud-Foam' is perfect for active children. We also recommend the aerodynamic profile of the Stratos Aero. Please check the size chart.";
      products = [
        { 
          id: 'stratos-cloudrunner', 
          title: 'Stratos CloudRunner', 
          price: '289.00', 
          image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=200',
          link: '/products/stratos-cloudrunner' 
        },
        { 
          id: 'stratos-aero', 
          title: 'Stratos Aero', 
          price: '289.00', 
          image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=200',
          link: '/products/stratos-aero' 
        }
      ];
    } else {
      reply = "I am synced with the Stratos Storefront MCP. I can:\n- Identify our most elite (expensive) hardware.\n- Provide technical specifications (e.g., Zero-G soles).\n- Offer gift consultations based on age, style, or performance needs.\n- Check availability for our 'Hero' and 'Pre-order' collections.";
      products = [];
    }

    res.json({ reply, products });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
