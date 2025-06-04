import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, // Strong requirement for admin users
  },
  role: {
    type: String,
    default: 'admin', // You can manage roles.
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Connect it to orders collection
  }],
  lastLogin: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;