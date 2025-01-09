import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  }
});

const userModel = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Please enter a valid email address',
    ],
  },
  password: String, // Hashed
  profilePhoto: {
    public_id: String,
    url: String,
    secure_url: String,
  }, 
  address: [
    { 
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  ],
  role: {
    type: String,
    enum: ['user', 'admin'], // Enum for roles: regular user or admin
    default: 'user' // Default role
},
  contact_number: String,
  gender: { type: String, enum: ["male", "female", "other"] },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  
  // New tokens array
  tokens: [tokenSchema],
}, { timestamps: true });

export const user = mongoose.model("user", userModel);
  