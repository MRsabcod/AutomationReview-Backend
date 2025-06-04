import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import { readCSV } from '../utils/readCsv.js';
import fs from 'fs'
import {postGoogleReview, retryPostGoogleReview} from '../utils/automation.js' ;
import upload from '../utils/multer.js';
import { updateCsv } from '../utils/updateCsv.js';
import { getFileInfo, uploadFile } from '../utils/cloudinary.js';
import ClientCSVFile from '../models/ClientCsvFile.js';
import { Readable } from 'stream';
const userRouter = express.Router();


const generateToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    console.log(user);
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload: include user ID and email
      process.env.JWT_SECRET || 'your-secret-key', //  Use environment variable for security
      { expiresIn: '1h' } // Token expiration time
    );
     return token;
  } catch (error) {
    console.log(error);
  }
};


userRouter.post('/automate', async (req, res) => {
  try {
    const { placeId ,public_id} = req.body;
    if (!placeId) return res.status(400).json({ error: 'Missing placeId' });
    if (!public_id) return res.status(400).json({ error: 'Missing public id' });

    // 1. Get the latest file from MongoDB
  const  url  = await getFileInfo(public_id)
  console.log(url,public_id)
    if (!url) return res.status(404).json({ error: 'No CSV file found' });

    // 2. Read and filter the CSV
    const parsedData = await readCSV(url);
    const filteredData = parsedData.filter(r => r['gmail ID']);

    // 3. Loop through each row and run retryPostGoogleReview
    const results = [];

    for (const row of filteredData) {
      const {
        ['gmail ID']: gmailID,
        ['gmail password']: gmailPassword,
        ['review content']: reviewContent,
        rating
      } = row;

      try {
        const result = await retryPostGoogleReview({
          email: gmailID,
          password: gmailPassword,
          placeId,
          review: reviewContent,
          rating
        });

        results.push({
          email: gmailID,
          success: result.success,
          message: result.success ? result.message : result.error
        });

      } catch (err) {
        results.push({
          email: gmailID,
          success: false,
          message: `Unexpected error: ${err.message}`
        });
      }
    }

    // ✅ 4. Finally send the response back to the client
    return res.status(200).json({
      message: 'Automation completed',
      results
    });

  } catch (error) {
    console.error('Automation error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


userRouter.get('/read-csv', upload.any(), async (req, res) => {
  const filepath = req.files[0].path;
  const readFile = await readCSV(filepath); // e.g. gmailID, gmailPassword
res.json({
  file:readFile
})
})
userRouter.post('/upload-csv', upload.any(), async (req, res) => {
  // const {orderId}=req.body  
  console.log('Uploaded file path:', req.files);
  const accounts = req.files[0].path;
  const rating = req.files[1].path;

  try {
    const mergedFilePath = await updateCsv(accounts, rating);

    // Upload merged CSV to Cloudinary under 'client_csvs' folder
    const cloudinaryResult = await uploadFile(mergedFilePath, 'client_csvs');
  //  const savedDoc = await ClientCSVFile.create({
  //     asset_id: cloudinaryResult.asset_id,
  //     public_id: cloudinaryResult.public_id,
  //     Order:orderId,
  //     url: cloudinaryResult.url
  //   });
    // Delete all local files
    fs.unlinkSync(accounts);
    fs.unlinkSync(rating);
    fs.unlinkSync(mergedFilePath);

    res.json({
      message: 'CSV merged and uploaded successfully',
      fileInfo: {
        url: cloudinaryResult.url,
        asset_id: cloudinaryResult.asset_id,
        public_id: cloudinaryResult.public_id
      },
      // document:savedDoc
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Failed to process and upload CSV',
      details: err.message
    });
  }
});
userRouter.get('/file/:publicId', async (req, res) => {
  const { publicId } = req.params;

  try {
    // Get file URL from Cloudinary
    const  url  = await getFileInfo(publicId); // must use resource_type: 'raw'
    console.log('📦 File URL:', url);

    // Fetch the file content
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file from Cloudinary: ${response.statusText}`);
    }

    const nodeStream = Readable.fromWeb(response.body);

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${publicId}.csv"`);
    res.setHeader('Content-Type', 'text/csv');

    // Pipe the file to the response
    nodeStream.pipe(res);
  } catch (err) {
    console.error("❌ File streaming error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


userRouter.post("/register", async (req, res) => {
  const { email, fullName,password } = req.body
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res.status(400).send({ error: "Email already exists" });
  }

  try {
    const user = await User.create({
      fullName,
      email,
      password, // Store the hashed password here
      
    });

    const createdUser = await User.findById(user._id).select("-password"); // Exclude the password

    if (!createdUser) {
      return res.status(500).send({ error: "User not created" }); //  Improved error handling
    }


    res.status(200).send({ createdUser, message: "USER REGISTERED SUCCESSFULLY" });
  } catch (error) {
    console.error("Registration error:", error); // Log the error for debugging
    res.status(500).send({ error: error.message }); //  Send a 500 status on error
  }
});
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" }); // 401: Unauthorized
    }

    // 2. Check the password
    const isPasswordValid = await user.isCorrectPassword(password); // Use the method from your schema
    if (!isPasswordValid) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    // 3. Generate a JWT token (after successful login)
    const token = await generateToken(email)

    // 4. Send the token and user data in the response
    res.status(200).send({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        // Add other user data you want to send (excluding sensitive fields like password)
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ error: "Internal server error", details: error.message });
  }
});
userRouter.post('/:userId/post-googleBusinessProfile',async(req,res)=>{
  const {googleBusinessProfile}= req.body
  const {userId}= req.params 
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId }, // Filter to find the user by ID
      { googleBusinessProfile: googleBusinessProfile }, // Update the googleBusinessProfile field
      { new: true, runValidators: true } // Options: return the updated doc, run validation
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send({ user: updatedUser, message: "Google Business Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send({ error: "Internal server error", details: error.message }); // Include more details in the error response
  }
})
export default userRouter;
