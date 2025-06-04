import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
cloudinary.config({ 
  cloud_name: 'dptquhdoc', 
  api_key: '887929142373979', 
  api_secret: 'uU3y_GLuNEj9u0AyRdwdBky_t0s' // Click 'View API Keys' above to copy your API secret
});

export async function getFileInfo(publicId ) {
  try {
    console.log(publicId)
    // const result = await cloudinary.api.resources_by_asset_ids([assetId])
      const url = cloudinary.url(publicId,{
        resource_type:"raw"

      });
    console.log(url)
    return url;
  } catch (error) {
    throw new Error('Error retrieving file info: ' + error.message);
  }
}

//   export async function uploadToCloudinary(file) {
//     return new Promise((resolve, reject) => {
//         if (!file) {
//             reject(new Error('File is required'));
//             return;
//         }
//         console.log(file)

//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//                 resource_type: 'auto', // Detect file type automatically
//             },
//             (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );

//         // Convert the buffer to a readable stream
//         const bufferStream = new Readable();
//         bufferStream.push(file.buffer);
//         bufferStream.push(null); // End the stream

//         bufferStream.pipe(uploadStream); // Pipe the buffer stream to Cloudinary upload stream
//     });
// }
export async function uploadFile(filePath, folder = 'csv_files') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'raw' // 🔥 Important for CSV, PDF, ZIP, etc.
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      metadata: result
    };
  } catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}
