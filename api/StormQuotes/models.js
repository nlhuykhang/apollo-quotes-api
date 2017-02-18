export class StormQuotes {
  constructor({ connector }) {
    this.connector = connector;
  }

  getFiveQuotes = () => {
    const list = new Array(5).fill(1);

    return Promise.all(list.map(() => {
      return new Promise((resolve, reject) => {
        this.connector.get().then((re) => {
          resolve({
            content: re.quote,
            authorName: re.author,
          });
        }).catch(err => reject(err));
      });
    }));
  }
}
