// Custom Section Schema
const mongoose = require('mongoose');
const customSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
    msgperday:String,
  totalbroadcasts:String,
  content: {
    type: String,
    required: true
  },
  sectionType: {
    type: String,
    enum: ['info', 'feature', 'testimonial', 'other'],
    default: 'info'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


module.exports  = mongoose.model('CustomSection', customSectionSchema);