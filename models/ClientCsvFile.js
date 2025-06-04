// models/ClientCSVFile.js
import mongoose from 'mongoose';

const clientCSVFileSchema = new mongoose.Schema({
  asset_id: { type: String, required: true },
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  Order:{type: mongoose.Schema.Types.ObjectId,ref:'Order',required: true},
  uploadedAt: { type: Date, default: Date.now }
});

const ClientCSVFile = mongoose.model('ClientCSVFile', clientCSVFileSchema);
export default ClientCSVFile;
