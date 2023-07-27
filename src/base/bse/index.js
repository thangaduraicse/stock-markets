import axios from 'axios';
import logger from '../../logger.js';

const log = logger('BSEIndia');

class BSEIndia {
  #baseHeaders;
  #noOfConnections;

  constructor() {
    this.#baseHeaders = {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    };
    this.#noOfConnections = 0;
  }

  #sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async getBhavCopy(url) {
    let retries = 0;
    let hasError = false;

    do {
      while (this.#noOfConnections >= 5) {
        await this.#sleep(2000);
      }

      this.#noOfConnections++;

      try {
        log.info(`Getting BhavCopy from url: ${url}`);
        const response = await axios.get(url, {
          headers: {
            ...this.#baseHeaders,
          },
          maxRedirects: 0,
          responseType: 'arraybuffer',
        });

        this.#noOfConnections--;
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          log.info('===>> File Not Found!');
          this.#noOfConnections--;

          return;
        }

        log.error(`Retrying getting BhavCopy: ${error.message}`);
        hasError = true;
        retries++;
        this.#noOfConnections--;
        if (retries >= 10) throw error;
      }
    } while (hasError);
  }
}

export default BSEIndia;
