


// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   // Basic registration fields
//   firstName: { type: String },
//   lastName: { type: String },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// email:{type:String},
//   // WhatsApp API details (optional per user)
//   accessToken: { type: String, default: "" },
//   apiVersion: { type: String, default: "v23.0" },
//   phoneNumberId: { type: String, default: "" },

//   // Credits balance
//   creditCoins: { type: Number, default: 0 },

//   // Store created template IDs
//   templates: [{ type: String }],
// roles:{type:String, default:'user'},
//   // Additional verification fields
//   address: { type: String, default: "" },
//   gender: { 
//     type: String, 
//     enum: ['Male', 'Female', 'Other', ''], 
//     default: "" 
//   },
//   dateOfBirth: { type: Date },
  
//   // PAN Card verification
//   panCardNumber: { type: String, default: "" },
//   panVerification: {
//     isVerified: { type: Boolean, default: false },
//     verificationName: { type: String, default: "" }
//   },

//   // Aadhaar details (file upload)
//   aadhaarDocument: {
//     fileName: { type: String, default: "" },
//     filePath: { type: String, default: "" },
//     uploadDate: { type: Date }
//   },

//   // Agreement document (signed and uploaded)
//   agreementDocument: {
//     fileName: { type: String, default: "" },
//     filePath: { type: String, default: "" },
//     uploadDate: { type: Date }
//   },

//   // Overall verification status
//   isFullyVerified: { type: Boolean, default: false }

// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic registration fields - Fixed field names to match frontend
  firstname: { type: String, required: true }, // Changed from firstName
  lastname: { type: String, required: true },  // Changed from lastName
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  
  // Plan and subscription details
  selectedPlan: { 
    type: String, 
    //enum: ['monthly', 'quarterly', 'half-yearly', 'yearly'],
    required: true 
  },
  planTitle: { type: String, required: true },
  planPrice: { type: Number, required: true },
  validity: { type: Date, required: true },
  daysRemaining: { type: Number, default: 0 }, // Virtual field for easier access
  isActive: { type: Boolean, default: true },
  
  // Payment details
  paymentId: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'completed' 
  },
  
  // Billing and Shipping Address
  billingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  // Add these fields to your userSchema
  // In your User model/schema
// Business type
businessType: {
  type: String,
  enum: ['registered', 'non-registered'],
  default: 'non-registered'
},

// GST details (for registered businesses)
gstNumber: { type: String, default: "" },
gstCertificate: {
  fileName: { type: String, default: "" },
  filePath: { type: String, default: "" },
  uploadDate: { type: Date }
},

  creditBalance: Number,  // Will be initialized to 0 if missing

  phone: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 },

  campaignHistory: [{
    campaignId: String,
    campaignName: String,
     headerType: String,
     contactCount: Number,
    successfulMessages: Number,
    failedMessages: Number,
    refundAmount: Number,
    refundstatus:  { type: Boolean, default:false },
    processedAt: Date
  }],

  // WhatsApp Business Configuration (added after verification)
  whatsappBusiness: {
    metaBusinessId: { type: String, default: "" },
    accountId: { type: String, default: "" },
    phoneNumbers: [{
      phoneNumberId: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      displayName: { type: String, default: "" },
      verifiedName: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      addedAt: { type: Date, default: Date.now }
    }]
  },
  // WhatsApp API details (optional per user)
  accessToken: { type: String, default: "" },
  apiVersion: { type: String, default: "v23.0" },
  phoneNumberId: { type: String, default: "" },
  
  // Credits balance
  creditCoins: { type: Number, default: 0 },
  
  // Store created template IDs
  templates: [{ type: String }],
  roles: { type: String, default: 'user' },
  
  // Additional verification fields
  address: { type: String, default: "" },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other', ''], 
    default: "" 
  },
  dateOfBirth: { type: Date },
  
  // PAN Card verification
  panCardNumber: { type: String, default: "" },
  panVerification: {
    isVerified: { type: Boolean, default: false },
    verificationName: { type: String, default: "" }
  },
  
  // Aadhaar details (file upload)
  aadhaarDocument: {
    fileName: { type: String, default: "" },
    filePath: { type: String, default: "" },
    uploadDate: { type: Date }
  },
  
  // Agreement document (signed and uploaded)
  agreementDocument: {
    fileName: { type: String, default: "" },
    filePath: { type: String, default: "" },
    uploadDate: { type: Date }
  },
  
  // Overall verification status
  isFullyVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Add method to check if subscription is expired
userSchema.methods.isSubscriptionExpired = function() {
  return new Date() > this.validity;
};

// Add method to get days remaining
userSchema.methods.getDaysRemaining = function() {
  const now = new Date();
  const validity = new Date(this.validity);
  const diffTime = validity - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Pre-save hook to calculate days remaining
userSchema.pre('save', function(next) {
  this.daysRemaining = this.getDaysRemaining();
  next();
});

module.exports = mongoose.model('User', userSchema);