import { SyncBSEBhavCopy, SyncNSEBhavCopy } from '../scripts/index.js';
import Logger from '../logger.js';

const log = new Logger('Job::syncTodayBhavCopy');

const syncTodayBhavCopy = async () => {
  try {
    log.info('Started - Triggering job to sync today bhavcopy');
    const bseMarketTypes = Object.values(SyncBSEBhavCopy.BhavCopyTypes);
    const nseMarketTypes = Object.values(SyncNSEBhavCopy.BhavCopyTypes);

    for (const bseMarketType of bseMarketTypes) {
      const instance = new SyncBSEBhavCopy(bseMarketType);
      await instance.downloadToday();
    }

    for (const nseMarketType of nseMarketTypes) {
      const instance = new SyncNSEBhavCopy(nseMarketType);
      await instance.downloadToday();
    }

    log.info('Completed - Triggering job to sync today bhavcopy');
  } catch {
    /* empty */
  }
};

export default syncTodayBhavCopy;
