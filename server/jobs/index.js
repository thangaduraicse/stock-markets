import cron from 'node-cron';
import syncTodayBhavCopy from './sync-today-bhavcopy.js';

// Download Today BhavCopy on every day morning 8.45 am
cron.schedule('45 8 * * *', syncTodayBhavCopy);
