// routes/campaignLogs.js
const express = require("express");
const router = express.Router();
const CampaignLog = require("../models/CampaignLog");

// Save or Update Campaign Log
router.post("/save", async (req, res) => {
  try {
    const { userId, campaignName, templateName, sentCount, failedCount, pendingCount, totalCount, log, messageTable } = req.body;

    // Either update existing or create new
    const updated = await CampaignLog.findOneAndUpdate(
      { userId, campaignName, templateName },
      { sentCount, failedCount, pendingCount, totalCount, log, messageTable },
      { upsert: true, new: true }
    );

    res.json({ success: true, campaign: updated });
  } catch (err) {
    console.error("Error saving campaign log:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Campaign Log by userId & campaignName
router.get("/:userId/:campaignName", async (req, res) => {
  try {
    const { userId, campaignName } = req.params;
    const campaign = await CampaignLog.findOne({ userId, campaignName });
    if (!campaign) return res.json({ success: false, message: "No campaign found" });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
