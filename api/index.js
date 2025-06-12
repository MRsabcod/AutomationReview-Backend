// Import dependencies

import express from 'express';

import cookieParser from 'cookie-parser';

import 'dotenv/config'

import router from '../routes/index.js';

import cors from 'cors'
// import {fetchPerformanceData} from './utils/googleBusinessPerfomance.js';

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
// Define routes
app.use('/', router);


// Catch 404 and forward to error handler


// Error handler

const server=app.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${process.env.PORT|| server.address().port}`);
  // fetchPerformanceData()
})
// Export the app as a module
export default app;
