import { basename } from 'node:path';
import { BSEIndia } from '../base/index.js';
import {
  checkFileExist,
  extractZipFile,
  unlinkFileFromPath,
  writeToTemporaryFolder,
} from '../helpers/index.js';
import logger from '../logger.js';

const log = logger('DownloadBSEBhavCopy');

class DownloadBSEBhavCopy extends BSEIndia {
  #type;

  static get BhavCopyTypes() {
    return {
      derivatives: 'Derivative',
      equities: 'Equity',
    };
  }

  static validateConfig(type) {
    log.info('Validating config before instantiate');
    switch (type) {
      case DownloadBSEBhavCopy.BhavCopyTypes.derivatives:
      case DownloadBSEBhavCopy.BhavCopyTypes.equities: {
        return true;
      }

      default: {
        throw new Error('Invalid market type');
      }
    }
  }

  constructor(type) {
    DownloadBSEBhavCopy.validateConfig(type);

    log.info('Initiate downloading...');
    super();
    this.#type = type;
  }

  #getDayMonthAndYear(passedDate) {
    const date = new Date(passedDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return [day, month, year];
  }

  #buildUrl(date) {
    const [day, month, year] = this.#getDayMonthAndYear(date);
    if (this.#type === DownloadBSEBhavCopy.BhavCopyTypes.derivatives) {
      const fileName = `bhavcopy${day}-${month}-${year}.zip`;
      return `https://www.bseindia.com/download/Bhavcopy/Derivative/${fileName}`;
    }

    if (this.#type === DownloadBSEBhavCopy.BhavCopyTypes.equities) {
      const fileName = `EQ${day}${month}${year}_CSV.ZIP`;
      return `https://www.bseindia.com/download/BhavCopy/Equity/${fileName}`;
    }
  }

  #generateURLsForYears(from, to) {
    const dates = [];
    const currentDate = new Date();

    for (let year = from; year <= to; year++) {
      for (let month = 0; month < 12; month++) {
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= lastDayOfMonth; day++) {
          const date = new Date(year, month, day);

          if (date <= currentDate) {
            dates.push(this.#buildUrl(date));
          }
        }
      }
    }

    return [...dates].reverse();
  }

  #getFileNameFromURL(url) {
    const parsedURL = new URL(url);
    const pathname = parsedURL.pathname;

    return basename(pathname);
  }

  async #downloadFile(url, fileName) {
    try {
      const data = await this.getBhavCopy(url);

      if (data) {
        log.info('Writing the csv to bhavcopy folder');
        const filePath = await writeToTemporaryFolder(fileName, data);
        await extractZipFile(filePath, 'bse', this.#type.toLowerCase());
        await unlinkFileFromPath(filePath);
        log.info('Successfully the csv downloaded in bhavcopy folder');
      }
    } catch (error) {
      log.error(`Error downloading bhavcopy for url: ${url}, error: ${error.message}`);
    }
  }

  async download(from = 2013, to = 2023) {
    const urls = this.#generateURLsForYears(from, to);

    for (const url of urls) {
      const fileName = this.#getFileNameFromURL(url);
      const fileNameExist = await checkFileExist(fileName, 'bse', this.#type.toLowerCase());

      if (fileNameExist) {
        log.info(`File is already downloaded for URL - ${url}`);
      } else {
        log.info(`Download url - ${url}`);
        await this.#downloadFile(url, fileName);
      }
    }

    log.info('All files downloaded successfully.');
  }

  async downloadForLastNyears(numberOfYears = 10) {
    const to = new Date().getFullYear();
    const from = to - Number(numberOfYears);

    await this.download(from, to);
  }
}

try {
  let instance;

  instance = new DownloadBSEBhavCopy(DownloadBSEBhavCopy.BhavCopyTypes.derivatives);
  await instance.downloadForLastNyears(10);
  instance = new DownloadBSEBhavCopy(DownloadBSEBhavCopy.BhavCopyTypes.equities);
  await instance.downloadForLastNyears(10);
} catch (error) {
  console.error(error);
}
