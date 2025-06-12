import { join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const puppeteerConfig = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  chrome: {
    skipDownload: false,
  },
};

export default puppeteerConfig;