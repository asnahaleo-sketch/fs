import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  title: String,
  description: String,
  image: String,
  data: mongoose.Schema.Types.Mixed, // For flexible structures like features/pricing arrays
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
ContentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Content', ContentSchema);
