import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in Backend!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all content
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*');

    if (error) throw error;

    // Convert array back to the expected map format { section: data }
    const contentMap = data.reduce((acc, item) => {
      acc[item.section] = item;
      return acc;
    }, {});

    res.json(contentMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update content section (Upsert)
router.post('/', async (req, res) => {
  try {
    const { section, title, description, image, data } = req.body;
    if (!section) return res.status(400).json({ error: 'Section is required' });

    const { data: upsertData, error } = await supabase
      .from('site_content')
      .upsert({ 
        section, 
        title, 
        description, 
        image, 
        data, 
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(upsertData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update content by section (Partial update)
router.put('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { title, description, image, data } = req.body;
    
    const { data: updateData, error } = await supabase
      .from('site_content')
      .update({
        title,
        description,
        image,
        data,
        updated_at: new Date().toISOString()
      })
      .eq('section', section)
      .select()
      .single();

    if (error) throw error;
    res.json(updateData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete content by section
router.delete('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('section', section);

    if (error) throw error;
    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
