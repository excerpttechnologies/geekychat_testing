// Bottom Plan Schema
const mongoose = require('mongoose');
const bottomPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
    msgperday:String,
  totalbroadcasts:String,
  description: {
    type: String,
    required: true
  },
  messagingChargesText: {
    type: String,
    default: 'WhatsApp API messaging charges apply.'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    default: '/ mon'
  },
  buttonText: {
    type: String,
    default: 'Get Started for Free'
  },
  features: [{
    text: {
      type: String,
      required: true
    },
    ok: {
      type: Boolean,
      default: true
    }
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


module.exports  = mongoose.model('BottomPlan', bottomPlanSchema);