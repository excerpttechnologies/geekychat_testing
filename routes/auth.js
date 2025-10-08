// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // Register
// router.post('/register', async (req, res) => {
//   const { phone, password, firstname, lastname } = req.body;
//   try {
//     const existing = await User.findOne({ phone });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const newUser = new User({ phone, password, firstName: firstname, lastName: lastname });
//     await newUser.save();
//     res.status(201).json({ message: 'User registered' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error registering user' });
//   }
// });



// // Update user
// router.put('/:id', async (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({ message: 'User updated', updatedUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error updating user' });
//   }
// });

// // Delete user
// router.delete('/:id', async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.id);
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({ message: 'User deleted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting user' });
//   }
// });
// // Login
// router.post('/login', async (req, res) => {
//   const { phone, password } = req.body;
//   try {
//     const user = await User.findOne({ phone });
//     if (!user || user.password !== password) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     // Send userId along with success message
//     res.json({ message: 'Login successful', userId: user._id.toString() });
//   } catch (err) {
//     res.status(500).json({ message: 'Login failed' });
//   }
// });

// module.exports = router;



// auth.js - Backend authentication routes
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const multer = require('multer');
// const path = require('path');
// const User = require('../models/User');
// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'document/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, req.body.phone + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|pdf/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb('Error: Only images (JPEG, JPG, PNG) and PDF files are allowed!');
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });
// router.post('/register', async (req, res) => {
//   const { phone, password, firstname, lastname } = req.body;
//   try {
//     const existing = await User.findOne({ phone });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const newUser = new User({ phone, password, firstName: firstname, lastName: lastname });
//     await newUser.save();
//     res.status(201).json({ message: 'User registered' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error registering user' });
//   }
// });
// // Login route - Check verification status
// router.post('/login', async (req, res) => {
//   try {
//     const { phone, password } = req.body;

//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

// if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check if user needs verification
//     const needsVerification = !user.panVerification.isVerified || 
//                              !user.address || 
//                              !user.aadhaarDocument.fileName || 
//                              !user.agreementDocument.fileName;

//     res.json({
//       message: 'Login successful',
//       userId: user._id,
//       needsVerification: needsVerification,
//       user: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone,
//         isFullyVerified: user.isFullyVerified
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get user details for verification page
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update user verification details
// router.post('/verify-user', upload.fields([
//   { name: 'aadhaarDocument', maxCount: 1 },
//   { name: 'agreementDocument', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const { userId, address, gender, dateOfBirth, panCardNumber } = req.body;
    
//     const updateData = {
//       address,
//       gender,
//       dateOfBirth: new Date(dateOfBirth),
//       panCardNumber,
//       // Hardcoded PAN verification for now
//       'panVerification.isVerified': true,
//       'panVerification.verificationName': req.body.firstName + ' ' + req.body.lastName
//     };

//     // Handle file uploads
//     if (req.files.aadhaarDocument) {
//       updateData['aadhaarDocument.fileName'] = req.files.aadhaarDocument[0].originalname;
//       updateData['aadhaarDocument.filePath'] = req.files.aadhaarDocument[0].path;
//       updateData['aadhaarDocument.uploadDate'] = new Date();
//     }

//     if (req.files.agreementDocument) {
//       updateData['agreementDocument.fileName'] = req.files.agreementDocument[0].originalname;
//       updateData['agreementDocument.filePath'] = req.files.agreementDocument[0].path;
//       updateData['agreementDocument.uploadDate'] = new Date();
//     }

//     // Check if user is fully verified
//     if (updateData.address && updateData.panCardNumber && 
//         req.files.aadhaarDocument && req.files.agreementDocument) {
//       updateData.isFullyVerified = true;
//     }

//     const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
//     res.json({
//       message: 'Verification details updated successfully',
//       isFullyVerified: user.isFullyVerified
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Download agreement template
// router.get('/download-agreement', (req, res) => {
//   const file = path.join(__dirname, '../document/doc.pdf');
//   res.download(file, 'Agreement-Template.pdf');
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const Razorpay = require('razorpay');
const router = express.Router();
const jwt = require("jsonwebtoken");


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'document/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.phone + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only images (JPEG, JPG, PNG) and PDF files are allowed!');
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// router.post('/register', async (req, res) => {
//   const { phone, password, firstname, lastname ,email} = req.body;
//   try {
//     const existing = await User.findOne({ phone });
//     if (existing) return res.status(400).json({ message: 'User already exists' });

//     const newUser = new User({ phone, password, email,firstName: firstname, lastName: lastname });
//     await newUser.save();
//     res.status(201).json({ message: 'User registered' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error registering user' });
//   }
// });

// Login route - Check verification status
// router.post('/login', async (req, res) => {
//   try {
//     const { phone, password } = req.body;

//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check if user needs verification
//     const needsVerification = !user.panVerification.isVerified || 
//                              !user.address || 
//                              !user.aadhaarDocument.fileName || 
//                              !user.agreementDocument.fileName;

//     res.json({
//       message: 'Login successful',
//       userId: user._id,
//       needsVerification: needsVerification,
//       user: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone,
//         isFullyVerified: user.isFullyVerified,
//         creditCoins: user.creditCoins
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

const razorpay = new Razorpay({

  //original keys
  // key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RLnseEsSC5ALZV',
  // key_secret: process.env.RAZORPAY_KEY_SECRET || 'MpHy42DVgGXt1c3vjIb5SuQl',

  //testing
   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_qUmhUFElBiSNIs',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'wsBV1ts8yJPld9JktATIdOiS',
});

// Plan configuration with duration mapping
const planDurationMapping = {
  monthly: 30,
  quarterly: 90,
  //'half-yearly': 180,
  yearly: 365,
  free: 30,
  'essentials-1000': 30,
  'essentials-2500': 30,
  'essentials-5000': 30,
  'essentials-7500': 30,
  'essentials-10000': 30,
  'essentials-15000': 30,
  'essentials-20000': 30,
  'essentials-25000': 30,
  'essentials-30000': 30,
  'essentials-40000': 30,
  'essentials-50000': 30,
  fixed: 30,
};

// Helper function to calculate validity date
const calculateValidityDate = (selectedPlan) => {
  const currentDate = new Date();
  const durationInDays = planDurationMapping[selectedPlan];
  
  if (!durationInDays) {
    throw new Error('Invalid plan selected');
  }
  
  // Add the duration to current date
  const validityDate = new Date(currentDate);
  validityDate.setDate(validityDate.getDate() + durationInDays);
  
  return validityDate;
};

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount is required' 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// Verify Razorpay Payment (Optional - for additional security)
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'wsBV1ts8yJPld9JktATIdOiS');
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest === razorpay_signature) {
      res.json({ 
        success: true, 
        message: 'Payment verified successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

// Register User with Plan and Payment
router.post('/register', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      password,
      selectedPlan,
      planTitle,
      planPrice,
      paymentId,
      billingAddress,
      shippingAddress
    } = req.body;
console.log("req .reg.body",req.body);
    // Validation
    if (!firstname || !lastname || !phone || !email || !password || 
        !selectedPlan || !planTitle || !planPrice || !paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Validate phone number (remove +91 prefix if present)
    const cleanPhone = phone.replace(/^\+91/, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number must be exactly 10 digits' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { phone: cleanPhone },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this phone number or email' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Calculate validity date based on selected plan
    const validityDate = calculateValidityDate(selectedPlan);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      phone: cleanPhone,
      email,
      password: hashedPassword,
      selectedPlan,
      planTitle,
      planPrice,
      validity: validityDate,
      paymentId,
      paymentStatus: 'completed',
      billingAddress: {
        fullName: billingAddress.fullName,
        address: billingAddress.address,
        city: billingAddress.city,
        state: billingAddress.state,
        pincode: billingAddress.pincode,
        country: billingAddress.country || 'India'
      },
      shippingAddress: {
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India'
      },
      isActive: true,
       // Give some initial credits
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email,
        selectedPlan: newUser.selectedPlan 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userResponse = {
      _id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      phone: newUser.phone,
      email: newUser.email,
      selectedPlan: newUser.selectedPlan,
      planTitle: newUser.planTitle,
      planPrice: newUser.planPrice,
      validity: newUser.validity,
      daysRemaining: newUser.getDaysRemaining(),
      isActive: newUser.isActive,
      creditCoins: newUser.creditCoins,
      billingAddress: newUser.billingAddress,
      shippingAddress: newUser.shippingAddress,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `User already exists with this ${field}` 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during registration',
      error: error.message 
    });
  }
});



router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
    console.log("users",users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all users

// Approve user
// router.patch('/:userId/approve', async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.params.userId,
//       { isFullyVerified: true },
//       { new: true }
//     );
//     res.json({ message: 'User approved', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Approve user with WhatsApp Business configuration
router.patch('/:userId/approve', async (req, res) => {
  try {
    const { 
      isFullyVerified, 
      metaBusinessId, 
      accountId, 
      phoneNumbers // Array of { phoneNumberId, phoneNumber, displayName, verifiedName }
    } = req.body;

    // Validate required fields when approving
    if (isFullyVerified) {
      if (!metaBusinessId || !accountId || !phoneNumbers || phoneNumbers.length === 0) {
        return res.status(400).json({ 
          message: 'Meta Business ID, Account ID, and at least one phone number are required for approval' 
        });
      }

      // Validate phone numbers array
      for (const phone of phoneNumbers) {
        if (!phone.phoneNumberId || !phone.phoneNumber) {
          return res.status(400).json({ 
            message: 'Each phone number must have phoneNumberId and phoneNumber' 
          });
        }
      }
    }

    const updateData = {
      isFullyVerified,
      ...(isFullyVerified && {
        'whatsappBusiness.metaBusinessId': metaBusinessId,
        'whatsappBusiness.accountId': accountId,
        'whatsappBusiness.phoneNumbers': phoneNumbers.map(phone => ({
          phoneNumberId: phone.phoneNumberId,
          phoneNumber: phone.phoneNumber,
          displayName: phone.displayName || '',
          verifiedName: phone.verifiedName || '',
          isActive: true,
          addedAt: new Date()
        }))
      })
    };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ 
      message: isFullyVerified ? 'User approved and WhatsApp Business configured' : 'User status updated', 
      user 
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Update WhatsApp Business configuration
router.patch('/:userId/whatsapp-config', async (req, res) => {
  try {
    const { metaBusinessId, accountId, phoneNumbers } = req.body;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isFullyVerified) {
      return res.status(400).json({ message: 'User must be verified first' });
    }

    const updateData = {};
    if (metaBusinessId) updateData['whatsappBusiness.metaBusinessId'] = metaBusinessId;
    if (accountId) updateData['whatsappBusiness.accountId'] = accountId;
    if (phoneNumbers) {
      updateData['whatsappBusiness.phoneNumbers'] = phoneNumbers.map(phone => ({
        phoneNumberId: phone.phoneNumberId,
        phoneNumber: phone.phoneNumber,
        displayName: phone.displayName || '',
        verifiedName: phone.verifiedName || '',
        isActive: phone.isActive !== undefined ? phone.isActive : true,
        addedAt: phone.addedAt || new Date()
      }));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'WhatsApp Business configuration updated', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// View/Download documents
// View documents - Enhanced with proper headers
router.get('/documents/view', (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const absolutePath = path.resolve(filePath);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file extension to set proper content type
    const ext = path.extname(absolutePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
    }

    // Set proper headers for inline viewing
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    
    // For PDF files, add additional headers to ensure proper display
    if (ext === '.pdf') {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ message: 'Error viewing document' });
  }
});

// Download documents - Enhanced with error handling
router.get('/documents/download', (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }

    const absolutePath = path.resolve(filePath);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Extract filename for download
    const filename = path.basename(absolutePath);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.download(absolutePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
});
// Get user details for verification page


router.post('/verify-user', upload.fields([
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'agreementDocument', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }  
]), async (req, res) => {
  try {
    const { userId, businessType, gstNumber, address, gender, dateOfBirth, panCardNumber } = req.body;
    console.log("req.veri.body", req.body);
    
    // First, get the current user to check if they were already verified
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wasAlreadyVerified = currentUser.isFullyVerified;
    
    const updateData = {
      businessType: businessType || 'non-registered'
    };

    // DECLARE willBeFullyVerified HERE
    let willBeFullyVerified = false;

    if (businessType === 'registered') {
      updateData.gstNumber = gstNumber;
      
      if (req.files.gstCertificate) {
        updateData['gstCertificate.fileName'] = req.files.gstCertificate[0].originalname;
        updateData['gstCertificate.filePath'] = req.files.gstCertificate[0].path;
        updateData['gstCertificate.uploadDate'] = new Date();
      }
      
      willBeFullyVerified = gstNumber && req.files.gstCertificate;
      
    } else {
      updateData.address = address;
      updateData.gender = gender;
      updateData.dateOfBirth = new Date(dateOfBirth);
      updateData.panCardNumber = panCardNumber;
      updateData['panVerification.isVerified'] = true;
      updateData['panVerification.verificationName'] = req.body.firstName + ' ' + req.body.lastName;
      
      // Handle existing file uploads for non-registered
      if (req.files.aadhaarDocument) {
        updateData['aadhaarDocument.fileName'] = req.files.aadhaarDocument[0].originalname;
        updateData['aadhaarDocument.filePath'] = req.files.aadhaarDocument[0].path;
        updateData['aadhaarDocument.uploadDate'] = new Date();
      }
      
      if (req.files.agreementDocument) {
        updateData['agreementDocument.fileName'] = req.files.agreementDocument[0].originalname;
        updateData['agreementDocument.filePath'] = req.files.agreementDocument[0].path;
        updateData['agreementDocument.uploadDate'] = new Date();
      }
      
      willBeFullyVerified = address && panCardNumber && req.files.aadhaarDocument && req.files.agreementDocument;
    }

    // REMOVE THE DUPLICATE CODE BELOW (lines after this comment in your original code)
    // The file handling is already done in the if-else block above

    if (willBeFullyVerified) {
      // updateData.isFullyVerified = true;
      
      // Add 25 credits ONLY if user wasn't already verified
      if (!wasAlreadyVerified) {
        updateData.$inc = { creditCoins: 25 };
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    // Prepare response message
    let message = 'Verification details updated successfully';
    if (willBeFullyVerified && !wasAlreadyVerified) {
      message += '. 25 credits have been added to your account!';
    }
    
    res.status(200).json({
      message: message,
      creditCoins: user.creditCoins,
      creditsAdded: willBeFullyVerified && !wasAlreadyVerified ? 25 : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download agreement template
router.get('/download-agreement', (req, res) => {
  const file = path.join(__dirname, '../document/doc.pdf');
  res.download(file, 'Agreement-Template.pdf');
});




// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// WhatsApp API configuration
const WHATSAPP_TOKEN = 'EAAdzxxobLG4BPU8Lei8DhhuZCjlCthpNQ55ok3LGlpY1PSIzXsOnTrEje2BvKUZCjFPOWlTtJg1TezXPgjp7NrCPN5Nzv6x2BOF7lMQml80v4NNIIWFEZAy5H7ZBZAgk7ZBku0y7QIBIwMsQ9ZCVe6JpbAa9wSz1dHb7xeDJTw7msm7AoxF1YMumg01P1LGBAZDZD'; // Replace with your token
const WHATSAPP_PHONE_ID = '671028016100461'; // Your phone number ID
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send WhatsApp OTP
const sendWhatsAppOTP = async (phoneNumber, otp) => {
  try {
    const response = await axios.post(WHATSAPP_API_URL, {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: "login_otp_new",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otp
              }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: otp
              }
            ]
          }
        ]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP via WhatsApp');
  }
};

// Step 1: Send OTP (Check if user exists and send OTP)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp: otp,
      phone: phone,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now
      attempts: 0
    };
    
    otpStore.set(phone, otpData);

    // Send OTP via WhatsApp
    await sendWhatsAppOTP(phone, otp);

    res.json({
      message: 'OTP sent successfully to your WhatsApp',
      success: true
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to send OTP',
      success: false 
    });
  }
});

// Step 2: Verify OTP and Login
router.post('/verify-otp-login', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Check if OTP exists for this phone
    const otpData = otpStore.get(phone);
    
    if (!otpData) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check attempts (max 3 attempts)
    if (otpData.attempts >= 3) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      otpStore.set(phone, otpData);
      return res.status(400).json({ 
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.` 
      });
    }

    // OTP is valid, get user details
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Clear OTP from store
    otpStore.delete(phone);

    // Check if user needs verification
    const needsVerification = !user.panVerification.isVerified ||
                              !user.address ||
                              !user.aadhaarDocument.fileName ||
                              !user.agreementDocument.fileName;

    res.json({
      message: 'OTP verified successfully. Login successful!',
      userId: user._id,
      needsVerification: needsVerification,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isFullyVerified: user.isFullyVerified,
        creditCoins: user.creditCoins
      },
      success: true
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ 
      message: 'Server error during OTP verification',
      success: false 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Store new OTP
    const otpData = {
      otp: otp,
      phone: phone,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };
    
    otpStore.set(phone, otpData);

    // Send OTP via WhatsApp
    await sendWhatsAppOTP(phone, otp);

    res.json({
      message: 'New OTP sent successfully to your WhatsApp',
      success: true
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to resend OTP',
      success: false 
    });
  }
});

// Keep existing login route for password-based login
// router.post('/login', async (req, res) => {
//   try {
//     const { phone, password,email } = req.body;

//    const user = await User.findOne({
//   $or: [
//     { phone: phone },
//     { email: email }
//   ]
// });

//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check if user needs verification
//     const needsVerification = !user.panVerification.isVerified ||
//                               !user.address ||
//                               !user.aadhaarDocument.fileName ||
//                               !user.agreementDocument.fileName;

//     res.json({
//       message: 'Login successful',
//       userId: user._id,
//       needsVerification: needsVerification,
//       user: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         roles:user.roles,
//         phone: user.phone,
//         isFullyVerified: user.isFullyVerified,
//         creditCoins: user.creditCoins
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Validate required fields
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     // Find user by email
//     const user = await User.findOne({ email: email });

//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Check password
//     if (user.password !== password) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Check if user needs verification
//     const needsVerification = !user.panVerification.isVerified ||
//                               !user.address ||
//                               !user.aadhaarDocument.fileName ||
//                               !user.agreementDocument.fileName;

//     res.json({
//       message: 'Login successful',
//       userId: user._id,
//       needsVerification: needsVerification,
//       user: {
//         firstName: user.firstName,
//         lastName: user.lastName,
//         roles: user.roles,
//         phone: user.phone,
//         email: user.email,
        // isFullyVerified: user.isFullyVerified,
        // creditCoins: user.creditCoins
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if subscription is expired
    const isExpired = user.isSubscriptionExpired();
    const daysRemaining = user.getDaysRemaining();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        selectedPlan: user.selectedPlan 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    const needsVerification = !user.panVerification.isVerified ||
                              !user.address ||
                              !user.aadhaarDocument.fileName ||
                              !user.agreementDocument.fileName;
    // Return user data without password
    const userResponse = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      email: user.email,
      selectedPlan: user.selectedPlan,
      isFullyVerified: user.isFullyVerified,
      planTitle: user.planTitle,
      planPrice: user.planPrice,
      validity: user.validity,
      daysRemaining,
                  needsVerification: needsVerification,
        creditCoins: user.creditCoins,
      isActive: user.isActive && !isExpired,
      isExpired,
      creditCoins: user.creditCoins,
      roles: user.roles
    };

    // res.json({
    //   success: true,
    //   message: 'Login successful',
    //   token,
    //   user: userResponse
      
    // });
    res.json({
  success: true,
  message: 'Login successful',
  token,
  
  userId: user._id,  // Add this line
  needsVerification,  // Add this line
  user: userResponse
});

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login',
      error: error.message 
    });
  }
});
// Get user by phone number
router.get('/user/phone/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;