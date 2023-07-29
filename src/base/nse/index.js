import axios from 'axios';
import Logger from '../../logger.js';

const log = new Logger('NSEIndia');

class NSEIndia {
  #baseHeaders;
  #baseUrl;
  #cookies;
  #cookieUsedCount;
  #cookieMaxAge;
  #cookieExpiry;
  #noOfConnections;

  static get OptionSymbols() {
    return {
      index: {
        endpoint: '/api/option-chain-indices',
        symbols: ['NIFTY', 'FINNIFTY', 'BANKNIFTY', 'MIDCPNIFTY'],
      },
      currency: {
        endpoint: '/api/option-chain-currency',
        symbols: ['USDINR', 'EURINR', 'GBPINR', 'JPYINR', 'EURUSD', 'GBPUSD', 'USDJPY'],
      },
      commodity: {
        endpoint: '/api/option-chain-com',
        symbols: ['COPPER', 'GOLDM', 'SILVER'],
      },
    };
  }

  static validatePayload(symbol, type) {
    const types = Object.keys(NSEIndia.OptionSymbols);
    const {
      [type]: { symbols },
    } = NSEIndia.OptionSymbols;

    return symbols.includes(symbol) && types.includes(type);
  }

  static getOptionChainURL(symbol, type) {
    const {
      [type]: { endpoint },
    } = NSEIndia.OptionSymbols;
    return `${this.baseUrl}${endpoint}?symbol=${symbol}`;
  }

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

  #transformOptionChainResponse(response) {
    const { records } = JSON.parse(response);

    let data = new Map();

    if (records.data) {
      for (const record of records.data) {
        const { expiryDate } = record;
        const _records = data.has(expiryDate) ? [...data.get(expiryDate), record] : [record];
        data.set(expiryDate, _records);
      }
    }

    return {
      data: Object.fromEntries(data),
      expiryDates: records.expiryDates,
      strikePrices: records.strikePrices,
      timestamp: records.timestamp,
      underlyingValue: records.underlyingValue,
    };
  }

  async getOptionChainData(url) {
    let retries = 0;
    let hasError = false;

    do {
      while (this.noOfConnections >= 5) {
        await this.#sleep(2000);
      }

      this.noOfConnections++;

      try {
        const response = await axios.get(url, {
          headers: {
            ...this.baseHeaders,
            Cookie: await this.getNseCookies(),
          },
          responseType: 'json',
          transformResponse: this.#transformOptionChainResponse,
        });

        this.noOfConnections--;
        return response.data;
      } catch (error) {
        hasError = true;
        retries++;
        this.noOfConnections--;
        if (retries >= 10) throw error;
      }
    } while (hasError);
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
