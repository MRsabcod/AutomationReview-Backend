// routes/csvRoute.js

import express from "express";
import { generateCsv } from "../utils/generateCsv.js"; // Import the generateCsv function
import upload from "../utils/multer.js";
import { uploadFile } from "../utils/cloudinary.js";
import Upload from "../models/AccountFile.js";
// import upload from '../utils/multer.js';
// import uploadFile from '../utils/googleDrive.js';

const adminRouter = express.Router();

// Sample data for demonstration
const users = [
  [
    
    { id: "reviewContent", title: "review content" },
    { id: "rating", title: "rating" },
  ],
  {
    
    reviewContent: "Great product! Will buy again.",
    rating: 5
  },
  {
 
    reviewContent: "Good quality, but delivery was slow.",
    rating: 4,
  },
  {
  
    reviewContent: "Very satisfied with the service. Excellent.",
    rating: 3,
  },
];

const useraccounts = [
  {
    gmailID: "sabeebr97@gmail.com",
    gmailPassword: "Sabeeb#123",
  },
  {
    gmailID: "lauren13319191@gmail.com",
    gmailPassword: "Pa$$word786",
  },
  // {
  //   gmailID: 'sample.email@gmail.com',
  //   gmailPassword: 'passwordtest'
  // },
  // {
  //   gmailID: 'another.user@gmail.com',
  //   gmailPassword: 'simple123'
  // },
  // {
  //   gmailID: 'data.entry@gmail.com',
  //   gmailPassword: 'testing456'
  // }
];
// Route to generate and download the CSV file

adminRouter.get("/generate-csv", (req, res) => {
  console.log(users.slice(1))
  generateCsv(users, (err, filePath) => {
    if (err) {
      return res.status(500).send("Error generating CSV file");
    }

    // Send the CSV file to the client for download
    res.download(filePath, "google_credentials.csv", (downloadErr) => {
      if (downloadErr) {
        console.error("Error downloading file:", downloadErr);
      } else {
        console.log("File downloaded");
        // Optionally, delete the file after download
        // fs.unlinkSync(filePath);
      }
    });
  });
});

adminRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const cloudRes = await uploadFile(req.file.path, 'csv_uploads');

    const newUpload = new Upload({
      asset_id: cloudRes.asset_id,
      public_id: cloudRes.public_id,
      url: cloudRes.url
    });

    const savedDoc = await newUpload.save();

    res.status(200).json({
      message: 'File uploaded & saved successfully',
      file: savedDoc
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
export default adminRouter;
