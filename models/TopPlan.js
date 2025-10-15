const mongoose = require('mongoose');


const topPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  msgperday:String,
  totalbroadcasts:String,
  prices: {
    monthly: {
      type: Number,
      required: true,
      min: 0
    },
    yearly: {
      type: Number,
      required: true,
      min: 0
    }
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    type: String,
    trim: true
  }],
  addons: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Start Free 7 Days Trial'
  },
  contact: {
    type: Boolean,
    default: false
  },
  customStartText: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


// Models
module.exports  = mongoose.model('TopPlan', topPlanSchema);
