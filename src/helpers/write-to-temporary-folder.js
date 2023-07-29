import Logger from '../logger.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, unlink, writeFile } from 'node:fs/promises';

export const __dirname = dirname(fileURLToPath(import.meta.url));

const { log } = new Logger('src/helpers/write-to-temporary-folder.js::Utils');

export const writeToTemporaryFolder = async (fileName, data) => {
  const filePath = join(__dirname, `../../temp/${fileName}`);

  log.info(`Write file for file name: ${fileName} in file path: ${filePath}`);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, data);

  return filePath;
};

export const unlinkFileFromPath = async (filePath) => await unlink(filePath);
