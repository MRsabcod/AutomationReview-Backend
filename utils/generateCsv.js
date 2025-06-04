import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

// Function to generate CSV file
export const generateCsv = (users, callback) => {
    // Ensure the users array is of length 100 by repeating the array
  

    // If users array exceeds 100, trim it to exactly 100
   
    

    // Define CSV file path
    const csvFilePath = path.join(process.cwd(), 'google_credentials.csv');

    // Set up CSV writer
    const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: users[0]
    });

    // Write records to CSV
    csvWriter.writeRecords(users.slice(1))
        .then(() => {
            console.log('CSV file was written successfully');
            callback(null, csvFilePath); // Callback with file path on success
        })
        .catch((err) => {
            console.error('Error writing CSV:', err);
            callback(err, null); // Callback with error
        });
}; 

