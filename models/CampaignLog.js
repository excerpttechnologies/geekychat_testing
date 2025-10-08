// models/CampaignLog.js
const mongoose = require("mongoose");

const CampaignLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  campaignName: { type: String, required: true },
  templateName: { type: String, required: true },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  log: { type: [String], default: [] }, // array of log messages
  messageTable: [
    {
      recipient: String,
      status: String,
      time: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CampaignLog", CampaignLogSchema);
