import rp from 'request-promise';

export class StormQuotesConnector {
  constructor() {
    this.rp = rp;
  }

  get = () => {
    return this.rp({
      uri: 'http://quotes.stormconsultancy.co.uk/random.json',
      json: true,
    });
  }
}
