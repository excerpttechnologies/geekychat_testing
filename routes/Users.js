// 📁 server/routes/Users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Delete template from a user's templates array
router.delete('/:userId/templates/:templateId', async (req, res) => {
  try {
    const { userId, templateId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { templates: templateId } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'Template deleted successfully',
      updatedUser
    });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ message: 'Error deleting template', error: err.message });
  }
});




module.exports = router;
