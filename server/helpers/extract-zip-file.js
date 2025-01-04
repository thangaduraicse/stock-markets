import AdmZip from 'adm-zip';
import Logger from '../logger.js';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { log } = new Logger('src/helpers/extract-zip-file.js::Utils');

export const extractZipFile = async (zipFilePath, exchange, type) => {
  log.info(`Extract file from zip present in file path: ${zipFilePath}`);
  const extractToPath = join(__dirname, `../../bhavcopy/${exchange}/${type}`);
  const zip = new AdmZip(zipFilePath);

  await mkdir(extractToPath, { recursive: true });
  await zip.extractAllTo(extractToPath, true);
};
