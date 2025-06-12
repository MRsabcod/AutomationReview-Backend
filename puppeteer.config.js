import { join } from 'path';

const puppeteerConfig = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  chrome: {
    skipDownload: false,
  },
};

export default puppeteerConfig;