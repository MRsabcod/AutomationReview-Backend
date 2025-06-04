// updateCsv.js
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { readCSV } from './readCsv.js';

export const updateCsv = async (accountsCsvPath, reviewsCsvPath) => {
  // 1. Read both CSV files
  const accounts = await readCSV(accountsCsvPath); // e.g. gmailID, gmailPassword
  const reviews = await readCSV(reviewsCsvPath);   // e.g. reviewContent, rating

  const mergedRecords = [];

  // 2. Pair accounts with reviews by index
  const maxLength = Math.max(accounts.length, reviews.length);
  for (let i = 0; i < maxLength; i++) {
    mergedRecords.push({
      ...accounts[i],
      ...reviews[i],
    });
  }

  // 3. Combine headers dynamically
  const allKeys = new Set();
  mergedRecords.forEach(record => {
    Object.keys(record).forEach(key => allKeys.add(key));
  });

  const headers = [...allKeys].map(key => ({ id: key, title: key }));

  // 4. Write the final CSV
  const outputPath = path.join(process.cwd(), 'accounts_content.csv');
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: headers,
  });

  await csvWriter.writeRecords(mergedRecords);

  return outputPath;
};
