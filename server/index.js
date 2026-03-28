import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contentRoutes from './routes/content.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// NOTE: Using a local JSON database (server/db.json) fallback since MongoDB might not be running locally!
// If you want MongoDB, you can uncomment this when your local instance is active:
/*
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/luminescent';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error. Falling back to JSON.', err));
*/

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);

// Add a simple auth route for the Admin Panel
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPass) {
    res.json({ token: 'fake-jwt-token-for-demo', success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials', success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
