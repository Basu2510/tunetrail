const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  // Common fields
  type: {
    type: String,
    enum: ['song', 'album'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  artwork: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    default: 'Unknown'
  },
  releaseYear: {
    type: String,
    default: ''
  },

  // Song-specific
  trackId: {
    type: String,
    default: ''
  },
  albumName: {
    type: String,
    default: ''
  },
  previewUrl: {
    type: String,
    default: ''
  },
  durationMs: {
    type: Number,
    default: 0
  },

  // Album-specific
  albumId: {
    type: String,
    default: ''
  },
  trackCount: {
    type: Number,
    default: 0
  },

  // User journal fields
  mood: {
    type: String,
    enum: ['energetic', 'chill', 'melancholic', 'happy', 'focused', 'romantic', 'angry', ''],
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  listenedOn: {
    type: Date,
    default: Date.now
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate entries (same song/album saved twice)
entrySchema.index({ trackId: 1, type: 1 }, { unique: false });

module.exports = mongoose.model('Entry', entrySchema);
