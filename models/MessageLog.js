const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignName: { type: String },
  templateName: { type: String },
  recipientNumber: { type: String, required: true },
  messageStatus: { type: String, enum: ['sent', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessageLog', messageLogSchema);
