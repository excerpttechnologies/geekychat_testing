const express = require("express");
const multer = require("multer");
const Campaign = require("../models/Campigns")

const router = express.Router();

// file upload (local storage, you can replace with cloud later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * Save a new campaign
 */
// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     const { campaignName, phoneNumberId, templateName, headerType, contacts, status, scheduleDate, scheduleTime, scheduleMode } = req.body;

//     const newCampaign = new Campaign({
//       campaignName,
//       phoneNumberId,
//       templateName,
//       headerType,
//       contacts: JSON.parse(contacts || "[]"),
//       status,
//       scheduleDate,
//       scheduleTime,
//       scheduleMode,
//       fileName: req.file ? req.file.originalname : null,
//       fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
//     });

//     await newCampaign.save();
//     res.json({ success: true, campaign: newCampaign });
//   } catch (err) {
//     console.error("❌ Error creating campaign:", err);
//     res.status(500).json({ success: false, error: "Server Error" });
//   }
// });
// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     const { 
//       campaignName, 
//       phoneNumberId, 
//       templateName, 
//       headerType, 
//       contacts, 
//       status, 
//       scheduleDate, 
//       scheduleTime, 
//       scheduleMode,
//       messageDetails // New field for message details
//     } = req.body;

//     const newCampaign = new Campaign({
//       campaignName,
//       phoneNumberId,
//       templateName,
//       headerType,
//       contacts: JSON.parse(contacts || "[]"),
//       status: status || 'sent',
//       scheduleDate,
//       scheduleTime,
//       scheduleMode,
//       fileName: req.file ? req.file.originalname : null,
//       fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
//       messageDetails: messageDetails || [], // Store message details
//       updatedAt: new Date()
//     });

//     await newCampaign.save();
    
//     console.log("✅ Campaign saved with message details:", {
//       campaignName,
//       totalContacts: newCampaign.contacts.length,
//       totalMessages: newCampaign.messageDetails.length
//     });

//     res.json({ success: true, campaign: newCampaign });
//   } catch (err) {
//     console.error("❌ Error creating campaign:", err);
//     res.status(500).json({ success: false, error: "Server Error" });
//   }
// });
// router.post("/batch", async (req, res) => {
//   try {
//     const {
//       campaignName,
//       phoneNumberId,
//       templateName,
//       headerType,
//       contacts,
//       status,
//       messageDetails,
//       userPhone,
//       batchNumber,
//       parentCampaign,
//       stats
//     } = req.body;

//     // Create smaller payload for large campaigns
//     const batchCampaign = new Campaign({
//       campaignName,
//       phoneNumberId,
//       templateName,
//       headerType,
//       contacts: Array.isArray(contacts) ? contacts : [],
//       status: status || 'partial',
//       messageDetails: Array.isArray(messageDetails) ? messageDetails : [],
//       userPhone,
//       batchNumber,
//       parentCampaign,
//       stats: stats || {
//         totalContacts: contacts?.length || 0,
//         successfulMessages: messageDetails?.filter(msg => msg.status === 'sent').length || 0,
//         failedMessages: messageDetails?.filter(msg => msg.status === 'failed').length || 0,
//         successRate: 0
//       },
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });
    
//     await batchCampaign.save();
   
//     console.log(`✅ Batch campaign saved:`, {
//       campaignName,
//       batchNumber,
//       status,
//       contacts: contacts?.length || 0,
//       messageDetails: messageDetails?.length || 0,
//       stats
//     });
    
//     res.json({ 
//       success: true, 
//       campaign: {
//         _id: batchCampaign._id,
//         campaignName: batchCampaign.campaignName,
//         batchNumber: batchCampaign.batchNumber,
//         status: batchCampaign.status,
//         stats: batchCampaign.stats
//       }
//     });
//   } catch (err) {
//     console.error("❌ Error creating batch campaign:", err);
//     res.status(500).json({ 
//       success: false, 
//       error: "Server Error",
//       message: err.message 
//     });
//   }
// });

// Route to get all batches of a campaign
router.get("/batches/:parentCampaign", async (req, res) => {
  try {
    const batches = await Campaign.find({ 
      parentCampaign: req.params.parentCampaign 
    }).sort({ batchNumber: 1 });
    
    // Aggregate statistics
    let totalContacts = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    batches.forEach(batch => {
      totalContacts += batch.contacts.length;
      totalSuccessful += batch.messageDetails.filter(msg => msg.status === 'sent').length;
      totalFailed += batch.messageDetails.filter(msg => msg.status === 'failed').length;
    });
    
    res.json({
      success: true,
      batches,
      summary: {
        totalBatches: batches.length,
        totalContacts,
        totalSuccessful,
        totalFailed,
        successRate: totalContacts > 0 ? ((totalSuccessful / totalContacts) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error("❌ Error fetching campaign batches:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});
// Additional route to get campaign details with message info
router.get("/:id/details", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }

    // Calculate success metrics
    const totalMessages = campaign.messageDetails.length;
    const successfulMessages = campaign.messageDetails.filter(msg => msg.status === 'sent').length;
    const failedMessages = campaign.messageDetails.filter(msg => msg.status === 'failed').length;

    res.json({
      success: true,
      campaign,
      metrics: {
        totalMessages,
        successfulMessages,
        failedMessages,
        successRate: totalMessages > 0 ? (successfulMessages / totalMessages * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error("❌ Error fetching campaign details:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});
/**
 * Fetch all campaigns
 */
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

/**
 * Get single campaign by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

/**
 * Update existing campaign
 */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.fileName = req.file.originalname;
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.contacts) {
      updateData.contacts = JSON.parse(req.body.contacts);
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, campaign: updatedCampaign });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

module.exports = router;
