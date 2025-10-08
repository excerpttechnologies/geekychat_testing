const express = require('express');
const MessageLog = require('../models/MessageLog');
const router = express.Router();

// Get logs for a user
router.get('/report/:userId', async (req, res) => {
  try {
    const logs = await MessageLog.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new message log
router.post('/add', async (req, res) => {
  try {
    const { userId, campaignName, templateName, recipientNumber, messageStatus } = req.body;

    if (!userId || !campaignName || !templateName || !recipientNumber || !messageStatus) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const newLog = new MessageLog({
      userId,
      campaignName,
      templateName,
      recipientNumber,
      messageStatus,
      timestamp: new Date()
    });

    await newLog.save();
    res.json({ success: true, message: 'Message log saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
