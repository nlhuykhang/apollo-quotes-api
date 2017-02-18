import rp from 'request-promise';

export class RandomQuotesConnector {
  constructor({ key }) {
    this.key = key;

    this.rp = rp;
  }
  get = () => {
    return this.rp({
      uri: 'https://andruxnet-random-famous-quotes.p.mashape.com',
      json: true,
      headers: {
        'X-Mashape-Key': this.key,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });
  }
}
