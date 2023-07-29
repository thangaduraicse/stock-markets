import { basename } from 'node:path';
import { NSEIndia } from '../base/index.js';
import {
  checkFileExist,
  extractZipFile,
  sleep,
  unlinkFileFromPath,
  writeToTemporaryFolder,
} from '../helpers/index.js';
import Logger from '../logger.js';

const ABBREVIATED_MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];
const log = new Logger('DownloadNSEBhavCopy');

class DownloadNSEBhavCopy extends NSEIndia {
  #type;

  static get BhavCopyTypes() {
    return {
      derivatives: 'DERIVATIVES',
      equities: 'EQUITIES',
    };
  }

  static validateConfig(type) {
    log.info('Validating config before instantiate');
    switch (type) {
      case DownloadNSEBhavCopy.BhavCopyTypes.derivatives:
      case DownloadNSEBhavCopy.BhavCopyTypes.equities: {
        return true;
      }

      default: {
        throw new Error('Invalid market type');
      }
    }
  }

  constructor(type) {
    DownloadNSEBhavCopy.validateConfig(type);

    log.info('Initiate downloading...');
    super();
    this.#type = type;
  }

  #getDayMonthAndYear(passedDate) {
    const date = new Date(passedDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = ABBREVIATED_MONTH_NAMES[date.getMonth()];
    const year = String(date.getFullYear());

    return [day, month, year];
  }

  #buildUrl(date) {
    const [day, month, year] = this.#getDayMonthAndYear(date);
    if (this.#type === DownloadNSEBhavCopy.BhavCopyTypes.derivatives) {
      return (
        'https://archives.nseindia.com/content/historical/DERIVATIVES/' +
        `${year}/${month}/fo${day}${month}${year}bhav.csv.zip`
      );
    }

    if (this.#type === DownloadNSEBhavCopy.BhavCopyTypes.equities) {
      return (
        'https://archives.nseindia.com/content/historical/EQUITIES/' +
        `${year}/${month}/cm${day}${month}${year}bhav.csv.zip`
      );
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
        await extractZipFile(filePath, 'nse', this.#type.toLowerCase());
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
      const fileNameExist = await checkFileExist(fileName, 'nse', this.#type.toLowerCase());

      if (fileNameExist) {
        log.info(`File is already downloaded for URL - ${url}`);
      } else {
        log.info(`Download url - ${url}`);
        await sleep(500);
        await this.#downloadFile(url, fileName);
        await sleep(500);
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

export default DownloadNSEBhavCopy;
