const express = require('express');
const multer = require('multer');
const axios = require('axios');
const User = require('../models/User');
const MessageLog = require('../models/MessageLog'); // ✅ added
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Credits endpoints (require auth) ---

router.get('/credits/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('creditCoins phone');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ creditCoins: user.creditCoins, userId: user._id, phone: user.phone });
  } catch (err) {
    console.error('GET credits error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/credits/add', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (typeof amount !== 'number') return res.status(400).json({ message: 'amount (number) is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.creditCoins = (user.creditCoins || 0) + amount;
    await user.save();
    return res.json({ message: 'Credits added', creditCoins: user.creditCoins });
  } catch (err) {
    console.error('ADD credits error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/credits/deduct', async (req, res) => {
  try {
    const { userId } = req.body;
    const amount = Number(req.body.amount) || 1;
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ message: 'amount must be a positive number' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.creditCoins || 0) < amount) {
      return res.status(400).json({ message: 'Not enough credits', creditCoins: user.creditCoins });
    }

    user.creditCoins -= amount;
    await user.save();
    return res.json({ message: 'Credits deducted', creditCoins: user.creditCoins });
  } catch (err) {
    console.error('DEDUCT credits error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/save-template', async (req, res) => {
  try {
    const { userId, templateId } = req.body;
    if (!userId || !templateId) {
      return res.status(400).json({ message: 'userId and templateId required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.templates.includes(templateId)) {
      user.templates.push(templateId);
      await user.save();
    }

    return res.json({ message: 'Template saved to user', templates: user.templates });
  } catch (err) {
    console.error('SAVE template error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user-templates/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allTemplates = [];
    for (const tId of user.templates) {
      try {
        const metaRes = await axios.get(`https://graph.facebook.com/${user.apiVersion}/${tId}?access_token=${user.accessToken}`);
        allTemplates.push(metaRes.data);
      } catch (err) {
        console.error(`Failed to fetch template ${tId}`, err.response?.data || err.message);
      }
    }

    return res.json({ templates: allTemplates });
  } catch (err) {
    console.error('USER templates fetch error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// --- Send WhatsApp ---
router.post(
  '/send',
  authMiddleware,
  upload.fields([{ name: 'image' }, { name: 'video' }, { name: 'doc' }]),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (!user.accessToken || !user.apiVersion || !user.phoneNumberId) {
        return res.status(400).json({ message: 'WhatsApp API credentials not set for this user' });
      }

      const { to, message, templateName, templateLanguage, campaignName } = req.body;

      const url = `https://graph.facebook.com/${user.apiVersion}/${user.phoneNumberId}/messages`;
      const payload = { messaging_product: 'whatsapp', to };

      if (templateName && templateLanguage) {
        payload.type = 'template';
        payload.template = {
          name: templateName.toLowerCase().replace(/\s+/g, "_"),
          language: { code: templateLanguage }
        };
      } else if (message) {
        payload.type = 'text';
        payload.text = { body: message };
      } else {
        return res.status(400).json({ message: 'No message or template provided' });
      }

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` }
      });

      // ✅ Save log on success
      await MessageLog.create({
        userId: req.userId,
        campaignName,
        templateName,
        recipientNumber: to,
        messageStatus: 'sent'
      });

      return res.json({ success: true, data: response.data });
    } catch (err) {
      console.error('WhatsApp send error', err.response?.data || err.message);

      // ✅ Save log on failure
      try {
        const { to, templateName, campaignName } = req.body;
        await MessageLog.create({
          userId: req.userId,
          campaignName,
          templateName,
          recipientNumber: to,
          messageStatus: 'failed'
        });
      } catch (logErr) {
        console.error('Failed to save message log', logErr);
      }

      return res.status(500).json({ message: 'Failed to send message' });
    }
  }
);

router.put('/update-template/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, language, category, headerText, bodyText, footerText, buttonType } = req.body;
    res.json({
      message: 'Template updated successfully',
      updatedTemplate: {
        id: templateId,
        name,
        language,
        category,
        headerText,
        bodyText,
        footerText,
        buttonType
      }
    });
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ message: 'Error updating template', error: err.message });
  }
});

module.exports = router;
