// Import dependencies

import express from 'express';

import cookieParser from 'cookie-parser';

import 'dotenv/config'

import router from './routes/index.js';
import { connectDB } from './db/index.js';
import multer from 'multer';
import cors from 'cors'
// import {fetchPerformanceData} from './utils/googleBusinessPerfomance.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
// Define routes
app.use('/', router);


// Catch 404 and forward to error handler


// Error handler
connectDB()
.then(() => {
const server=app.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${process.env.PORT|| server.address().port}`);
  // fetchPerformanceData()
})
})
// Export the app as a module
export default app;
