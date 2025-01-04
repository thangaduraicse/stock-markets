import { SyncBSEBhavCopy, SyncNSEBhavCopy } from '../scripts/index.js';
import Logger from '../logger.js';

const { log } = new Logger('src/jobs/sync-today-bhavcopy.js::syncTodayBhavCopy');

const syncTodayBhavCopy = async () => {
  try {
    log.info('Started - Triggering job to sync today bhavcopy');
    const bseMarketTypes = Object.values(SyncBSEBhavCopy.BhavCopyTypes);
    const nseMarketTypes = Object.values(SyncNSEBhavCopy.BhavCopyTypes);

    for (const bseMarketType of bseMarketTypes) {
      const today = new Date();
      const instance = new SyncBSEBhavCopy(bseMarketType);
      await instance.downloadByDate(today);
    }

    for (const nseMarketType of nseMarketTypes) {
      const today = new Date();
      const instance = new SyncNSEBhavCopy(nseMarketType);
      await instance.downloadByDate(today);
    }

    log.info('Completed - Triggering job to sync today bhavcopy');
  } catch {
    /* empty */
  }
};

export default syncTodayBhavCopy;
