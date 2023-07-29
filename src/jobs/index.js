import cron from 'node-cron';
import downloadTodayBhavCopy from './download-today-bhavcopy.js';

// Download Today BhavCopy on every day morning 8.45 am
cron.schedule('45 8 * * *', downloadTodayBhavCopy);
