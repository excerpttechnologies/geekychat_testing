const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  // Original keys
  // key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RLnseEsSC5ALZV',
  // key_secret: process.env.RAZORPAY_KEY_SECRET || 'MpHy42DVgGXt1c3vjIb5SuQl'

   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_qUmhUFElBiSNIs',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'wsBV1ts8yJPld9JktATIdOiS',
});

router.get('/credits/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
console.log('Fetching credits for phone:', phone);
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      creditCoins: user.creditCoins || 0,
      userId: user._id,
      firstName: user.firstName 
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get user by phone (for local storage lookup)
router.get('/user-by-phone/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      userId: user._id, 
      firstName: user.firstName,
      lastName: user.lastName,
      creditCoins: user.creditCoins 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, userId, plan } = req.body;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId,
        plan,
        originalAmount: amount
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_qUmhUFElBiSNIs'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Verify payment and add credits
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      amount,
      plan
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'wsBV1ts8yJPld9JktATIdOiS')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment verified, add credits
    const creditsToAdd = parseInt(amount); // 1 rupee = 1 credit coin
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { creditCoins: creditsToAdd } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the transaction (optional - you can create a separate transactions model)
    console.log(`Payment successful: User ${userId} recharged ₹${amount} and received ${creditsToAdd} credits`);

    res.json({
      message: 'Payment verified and credits added successfully',
      creditCoins: user.creditCoins,
      creditsAdded: creditsToAdd,
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// Manual credit addition (for testing or admin use)
router.post('/credits/add', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid userId or amount' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { creditCoins: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Credits added successfully',
      creditCoins: user.creditCoins
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ message: 'Failed to add credits' });
  }
})

// Route to deduct credits when campaign is sent
router.post('/deduct-credits', async (req, res) => {
  try {
    const { userPhone, headerType, contactCount } = req.body;

    // Validate input
    if (!userPhone || !headerType || !contactCount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userPhone, headerType, contactCount' 
      });
    }

    // Define credit rates based on header type
    const creditRates = {
      'TEXT': 1,      // 1 credit per contact for text
      'IMAGE': 1.5,   // 1.5 credits per contact for image
      'VIDEO': 1.5,   // 1.5 credits per contact for video
      'DOCUMENT': 1.5 // 1.5 credits per contact for document
    };

    // Calculate total credits needed
    const creditRate = creditRates[headerType] || 1;
    const totalCreditsNeeded = contactCount * creditRate;

    // Find user by phone number
    const user = await User.findOne({ phone: userPhone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has enough credits
    if (user.creditCoins < totalCreditsNeeded) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient credits. Required: ${totalCreditsNeeded}, Available: ${user.creditCoins}`,
        requiredCredits: totalCreditsNeeded,
        availableCredits: user.creditCoins
      });
    }

    // Deduct credits
    user.creditCoins -= totalCreditsNeeded;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Credits deducted successfully',
      deductedCredits: totalCreditsNeeded,
      remainingCredits: user.creditCoins,
      creditRate: creditRate
    });

  } catch (error) {
    console.error('Error deducting credits:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Route to check if user has enough credits (optional - for pre-validation)
router.post('/check-credits', async (req, res) => {
  try {
    const { userPhone, headerType, contactCount } = req.body;

    const creditRates = {
      'TEXT': 1,
      'IMAGE': 1.5,
      'VIDEO': 1.5,
      'DOCUMENT': 1.5
    };

    const creditRate = creditRates[headerType] || 1;
    const totalCreditsNeeded = contactCount * creditRate;

    const user = await User.findOne({ phone: userPhone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const hasEnoughCredits = user.creditCoins >= totalCreditsNeeded;

    return res.status(200).json({ 
      success: true,
      hasEnoughCredits,
      requiredCredits: totalCreditsNeeded,
      availableCredits: user.creditCoins,
      creditRate: creditRate
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});




module.exports = router;