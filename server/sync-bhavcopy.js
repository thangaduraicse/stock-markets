import { Command } from 'commander';
import { SyncBSEBhavCopy, SyncNSEBhavCopy } from './scripts/index.js';

const validateOptions = (options) => {
  const { from, to } = options;

  if ((from || to) && ((from && !to) || (!from && to))) {
    throw new Error('Please specify start date and end date');
  }
};

const handleAction = async (options, cmd) => {
  validateOptions(options);

  const commandName = cmd.name();
  let { date, from, to, market, lastNYears } = options;

  try {
    let ClassModule;

    if (commandName === 'nse') {
      ClassModule = SyncNSEBhavCopy;
    }

    if (commandName === 'bse') {
      ClassModule = SyncBSEBhavCopy;
    }

    if (ClassModule) {
      const instance = new ClassModule(market);

      if (from && to) {
        from = Number.parseInt(from, 10);
        to = Number.parseInt(to, 10);

        await instance.download(from, to);
      } else if (Number.parseInt(lastNYears, 10) > 0) {
        await instance.downloadForLastNyears(lastNYears);
      } else if (date) {
        await instance.downloadByDate(date);
      } else {
        const today = new Date();
        await instance.downloadByDate(today);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const program = new Command();

program.name('sync-bhavcopy').description('CLI to Sync BhavCopy from NSE and BSE').version('1.0.0');

program
  .command('nse')
  .description('Sync BhavCopy from NSE India')
  .requiredOption('-m, --market <market>', 'NSE Market Type', 'EQUITIES')
  .option('-f, --from <from>', 'From Year')
  .option('-t, --to <to>', 'To Year')
  .option('-n, --last-n-years <lastNYears>', 'Last N years')
  .option('-d, --date <date>', 'Download by date')
  .addHelpText(
    'after',
    `
  Example usage:
    yarn sync-bhavcopy nse -m DERIVATIVES -f 2014 -t 2023
    yarn sync-bhavcopy nse --market EQUITIES --from 2014 --to 2023
    yarn sync-bhavcopy nse -m EQUITIES -n 5
    yarn sync-bhavcopy nse --market DERIVATIVES --last-n-years 5
    yarn sync-bhavcopy nse --market EQUITIES --date 2023-07-28
    yarn sync-bhavcopy nse -m DERIVATIVES -d 2023-07-28
  `
  )
  .action(handleAction);

program
  .command('bse')
  .description('Sync BhavCopy from BSE India')
  .requiredOption('-m, --market <market>', 'BSE Market Type', 'Equity')
  .option('-f, --from <from>', 'From Year')
  .option('-t, --to <to>', 'To Year')
  .option('-n, --last-n-years <lastNYears>', 'Last N years')
  .option('-d, --date <date>', 'Download by date')
  .addHelpText(
    'after',
    `
  Example usage:
    yarn sync-bhavcopy bse --market Derivative --from 2014 --t0 2023
    yarn sync-bhavcopy bse -m Equity -f 2014 -t 2023
    yarn sync-bhavcopy bse -m Equity -n 5
    yarn sync-bhavcopy bse --market Derivative --last-n-years 5
    yarn sync-bhavcopy bse --market Equity --date 2023-07-28
    yarn sync-bhavcopy bse -m Derivative -d 2023-07-28
  `
  )
  .action(handleAction);

program.parse();
