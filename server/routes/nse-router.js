import { Router } from 'express';
import { NSEIndia } from '../base/index.js';

class NSERouter extends Router {
  #_nseIndia;

  constructor() {
    super();
    this.#_nseIndia = new NSEIndia();

    this.get('/', this.#homePage.bind(this));
    this.get('/api/option-chain', this.#optionChain.bind(this));
  }

  #homePage(request, response) {
    response.json({
      message: 'OK',
      timestamp: new Date().toISOString(),
      IP: request.ip,
      URL: request.originalUrl,
    });
  }

  async #optionChain(request, response) {
    const { s, t } = request.query;
    const validPayload = NSEIndia.validatePayload(s, t);

    if (validPayload) {
      const url = this.#_nseIndia.getOptionChainURL(s, t);
      const data = await this.#_nseIndia.getOptionChainData(url);

      response.json(data);
    } else {
      let symbols = {};
      const types = Object.keys(NSEIndia.OptionSymbols);

      for (const type of types) {
        const {
          [type]: { symbols: _symbols },
        } = NSEIndia.OptionSymbols;

        symbols = { ...symbols, [type]: _symbols };
      }

      response.header('Content-Type', 'application/json').status(404).json({
        error: 'Uhh! Pass correct query params.',
        symbols,
        types,
      });
    }
  }
}

export default NSERouter;
