import fs from 'fs';
import csv from 'csv-parser';
import https from 'https';
import http from 'http';
import { parse } from 'url';

export const readCSV = (filePathOrUrl) => {
  return new Promise((resolve, reject) => {
    const results = [];

    const handleStream = (stream) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => {
          console.error('Error parsing CSV:', err);
          reject(err);
        });
    };

    // Check if it's a URL or local file
    if (/^https?:\/\//i.test(filePathOrUrl)) {
      const parsed = parse(filePathOrUrl);
      const lib = parsed.protocol === 'https:' ? https : http;

      lib.get(filePathOrUrl, (response) => {
        if (response.statusCode >= 400) {
          return reject(new Error(`Failed to fetch file. Status code: ${response.statusCode}`));
        }
        handleStream(response);
      }).on('error', (err) => {
        console.error('HTTP request error:', err);
        reject(err);
      });
    } else {
      // Local file
      const stream = fs.createReadStream(filePathOrUrl);
      handleStream(stream);
    }
  });
};
