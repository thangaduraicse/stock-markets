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
  let { from, to, market, lastNyears } = options;

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
      } else if (lastNyears) {
        await instance.downloadForLastNyears(lastNyears);
      } else {
        await instance.downloadToday();
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
  .requiredOption('-m, --market <market>', 'NSE Market Type')
  .option('-f, --from <from>', 'From Year')
  .option('-t, --to <to>', 'To Year')
  .option('-n, --last-n-years <lastNyears>', 'Last N years')
  .addHelpText(
    'after',
    `
  Example usage:
    npm run sync-bhavcopy -- nse -m DERIVATIVES -f 2014 -t 2023
    npm run sync-bhavcopy -- nse --market EQUITIES --from 2014 --t0 2023
  `
  )
  .action(handleAction);

program
  .command('bse')
  .description('Sync BhavCopy from BSE India')
  .requiredOption('-m, --market <market>', 'BSE Market Type')
  .option('-f, --from <from>', 'From Year')
  .option('-t, --to <to>', 'To Year')
  .option('-n, --last-n-years <lastNyears>', 'Last N years')
  .addHelpText(
    'after',
    `
  Example usage:
    npm run sync-bhavcopy -- bse --market Derivative --from 2014 --t0 2023
    npm run sync-bhavcopy -- bse -m Equity -f 2014 -t 2023
  `
  )
  .action(handleAction);

program.parse();
