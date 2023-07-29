import { DownloadBSEBhavCopy, DownloadNSEBhavCopy } from '../scripts/index.js';
import Logger from '../logger.js';

const log = new Logger('Job::DownloadTodayBhavCopy');

const downloadTodayBhavCopy = async () => {
  log.info('Started - Triggering job to download today bhavcopy');
  const bseMarketTypes = Object.values(DownloadBSEBhavCopy.BhavCopyTypes);
  const nseMarketTypes = Object.values(DownloadNSEBhavCopy.BhavCopyTypes);

  for (const bseMarketType of bseMarketTypes) {
    const instance = new DownloadBSEBhavCopy(bseMarketType);
    await instance.downloadToday();
  }

  for (const nseMarketType of nseMarketTypes) {
    const instance = new DownloadNSEBhavCopy(nseMarketType);
    await instance.downloadToday();
  }

  log.info('Completed - Triggering job to download today bhavcopy');
};

export default downloadTodayBhavCopy;
