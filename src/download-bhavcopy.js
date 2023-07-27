import { Command } from 'commander';
import { DownloadBSEBhavCopy, DownloadNSEBhavCopy } from './scripts/index.js';

const handleAction = async (options, cmd) => {
  const commandName = cmd.name();
  let { from, to, market } = options;

  try {
    from = Number.parseInt(from, 10);
    to = Number.parseInt(to, 10);

    let ClassModule;
    if (commandName === 'nse') {
      ClassModule = DownloadNSEBhavCopy;
    }

    if (commandName === 'bse') {
      ClassModule = DownloadBSEBhavCopy;
    }

    if (ClassModule) {
      const instance = new ClassModule(market);
      await instance.download(from, to);
    }
  } catch (error) {
    console.error(error);
  }
};

const program = new Command();

program
  .name('download-bhavcopy')
  .description('CLI to download BhavCopy from NSE and BSE')
  .version('1.0.0');

program
  .command('nse')
  .description('Download BhavCopy from NSE India')
  .requiredOption('-m, --market <market>', 'NSE Market Type')
  .requiredOption('-f, --from <from>', 'From Year')
  .requiredOption('-t, --to <to>', 'To Year')
  .addHelpText(
    'after',
    `
  Example usage:
    npm run download-bhavcopy -- nse -m DERIVATIVES -f 2014 -t 2023
    npm run download-bhavcopy -- nse --market EQUITIES --from 2014 --t0 2023
  `
  )
  .action(handleAction);

program
  .command('bse')
  .description('Download BhavCopy from BSE India')
  .requiredOption('-m, --market <market>', 'BSE Market Type')
  .requiredOption('-f, --from <from>', 'From Year')
  .requiredOption('-t, --to <to>', 'To Year')
  .addHelpText(
    'after',
    `
  Example usage:
    npm run download-bhavcopy -- bse --market Derivative --from 2014 --t0 2023
    npm run download-bhavcopy -- bse -m Equity -f 2014 -t 2023
  `
  )
  .action(handleAction);

program.parse();
