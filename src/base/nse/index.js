import axios from 'axios';
import logger from '../../logger.js';

const log = logger('NSEIndia');

class NSEIndia {
  #baseHeaders;
  #baseUrl;
  #cookies;
  #cookieUsedCount;
  #cookieMaxAge;
  #cookieExpiry;
  #noOfConnections;

  constructor(baseUrl) {
    this.#baseHeaders = {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    };
    this.#baseUrl = baseUrl || 'https://www.nseindia.com';
    this.#cookies = '';
    this.#cookieUsedCount = 0;
    this.#cookieMaxAge = 60;
    this.#cookieExpiry = Date.now() + this.#cookieMaxAge * 1000;
    this.#noOfConnections = 0;
  }

  #sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async #getNseCookies() {
    if (this.#cookies === '' || this.#cookieUsedCount > 10 || this.#cookieExpiry <= Date.now()) {
      log.info(`Getting NSE Cookies from ${this.#baseUrl}`);
      const response = await axios.get(this.#baseUrl, {
        headers: this.#baseHeaders,
      });
      const setCookies = response.headers['set-cookie'];
      const cookies = [];
      for (const cookie of setCookies) {
        const requiredCookies = ['nsit', 'nseappid', 'bm_sv', 'bm_mi', 'ak_bmsc', 'AKA_A2'];
        const cookieKeyValue = cookie.split(';')[0];
        const cookieEntry = cookieKeyValue.split('=');
        if (requiredCookies.includes(cookieEntry[0])) {
          cookies.push(cookieKeyValue);
        }
      }

      this.#cookies = cookies.join('; ');
      this.#cookieUsedCount = 0;
      this.#cookieExpiry = Date.now() + this.#cookieMaxAge * 1000;
    }

    this.#cookieUsedCount++;
    return this.#cookies;
  }

  async getBhavCopy(url, ignoreNSECookies = true) {
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
            Cookie: !ignoreNSECookies && (await this.#getNseCookies()),
          },
          maxRedirects: 0,
          responseType: 'arraybuffer',
        });

        this.#noOfConnections--;
        return response.data;
      } catch (error) {
        if (error.response?.status === 302) {
          log.info('===>> File Not Found!');
          this.#noOfConnections--;

          return;
        }

        log.error(`Retrying getting BhavCopy: ${error.message}`);
        hasError = true;
        retries++;
        this.#noOfConnections--;
        if (retries >= 5) throw error;
      }
    } while (hasError);
  }
}

export default NSEIndia;
