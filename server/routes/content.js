import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const DB_PATH = path.resolve('server/db.json');

// Initialize local DB file if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

// Helper to read DB
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Helper to write DB
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));


// Get all content
router.get('/', async (req, res) => {
  try {
    const contentMap = readDB();
    res.json(contentMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new content section
router.post('/', async (req, res) => {
  try {
    const { section, title, description, image, data } = req.body;
    if (!section) return res.status(400).json({ error: 'Section is required' });

    const db = readDB();
    db[section] = { section, title, description, image, data, updatedAt: Date.now() };
    writeDB(db);

    res.status(201).json(db[section]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update content by section
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { title, description, image, data } = req.body;
    
    const db = readDB();
    const existing = db[section] || { section };
    
    db[section] = {
      ...existing,
      title: title ?? existing.title,
      description: description ?? existing.description,
      image: image ?? existing.image,
      data: data ?? existing.data,
      updatedAt: Date.now()
    };
    writeDB(db);

    res.json(db[section]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete content by section
router.delete('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const db = readDB();
    if (db[section]) {
      delete db[section];
      writeDB(db);
    }
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
