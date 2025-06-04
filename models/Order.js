import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Connect to the User model
    required: true,
  },
  businessProfile: {
    type: String, //  Store either URL or Place ID
    required: true,
  },
  reviewQuantity: {
    type: Number,
    required: true,
  },
  reviewContentSource: {
    type: String, //  "manual", "csv", or "requested"
    required: true,
  },
  paymentOption: {
    type: String, // "online" or "manual"
    required: true,
  },
  paymentStatus: {
    type: String, //  "pending", "paid", "failed"
    required: true,
    default: 'pending',
  },
  orderStatus: {
    type: String, // "in progress", "completed"
    required: true,
    default: 'in progress',
  },
  csvFileLink: { // To store the link to the CSV file (if applicable)
     type: mongoose.Schema.Types.ObjectId,
     ref:"ClientCSVFile",
     
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;