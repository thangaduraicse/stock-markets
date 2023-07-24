import AdmZip from 'adm-zip';
import logger from '../logger.js';
import { dirname, join } from 'node:path';
import { access, mkdir } from 'node:fs/promises';
import { __dirname } from './path-utils.js';

const log = logger('ExtractZipFile');

export const extractZipFile = async (zipFilePath, exchange, type) => {
  log.info(`Extract file from zip present in file path: ${zipFilePath}`);
  const extractToPath = join(__dirname, `../../bhavcopy/${exchange}/${type}`);
  const zip = new AdmZip(zipFilePath);

  await mkdir(extractToPath, { recursive: true });
  await zip.extractAllTo(extractToPath, true);
};

export const checkFileExist = async (fileName, exchange, type) => {
  const filePath = join(__dirname, `../../bhavcopy/${exchange}/${type}/${fileName}`);

  await mkdir(dirname(filePath), { recursive: true });
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};
