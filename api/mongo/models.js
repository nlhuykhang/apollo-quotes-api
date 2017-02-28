import mongoose from 'mongoose';

const authorSchema = mongoose.Schema({
  name: String,
});

const quoteSchema = mongoose.Schema({
  content: String,
  // authorId: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authors',
  },
  votes: Number,
});

const collectionSchema = mongoose.Schema({
  name: String,
});

const quoteToCollectionSchema = mongoose.Schema({
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotes',
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collections',
  },
});

const QuoteModel = mongoose.model('Quotes', quoteSchema);
const AuthorModel = mongoose.model('Authors', authorSchema);
const CollectionModel = mongoose.model('Collections', collectionSchema);
const QuoteToCollectionModel = mongoose.model('QuoteToCollections', quoteToCollectionSchema);

export class Collections {
  findAll() {
    return CollectionModel.find({});
  }
  insert(collection) {
    return new CollectionModel({
      name: collection.name,
    }).save().then((r) => {
      return CollectionModel.findOne(r);
    });
  }
  addQuoteToCollection({ quoteId, collectionId }) {
    return new QuoteToCollectionModel({
      quoteId,
      collectionId,
    }).save().then(() => {
      return CollectionModel.findOne({
        _id: collectionId,
      });
    }).catch(err => console.error(err));
  }
  getAllQuoteByCollectionId({ _id }) {
    return QuoteToCollectionModel.find({
      collectionId: _id,
    }).then((re) => {
      const quoteIds = re.map(o => o.quoteId);
      return QuoteModel.find({
        _id: {
          $in: quoteIds,
        },
      }).populate('author');
    });
  }
  getCollectionById({ collectionId }) {
    return CollectionModel.findOne({
      _id: collectionId,
    });
  }
}

export class Quotes {
  findAll() {
    return QuoteModel.find({}).populate('author');
  }
  insert(quote) {
    return new QuoteModel({
      content: quote.content,
      author: quote.authorId,
      votes: 0,
    }).save().then((q) => {
      return QuoteModel.findOne(q).populate('author').exec();
    });
  }
  getAllQuoteByAuthorId(_id) {
    return QuoteModel.find({
      author: _id,
    }).populate('author');
  }
  upVote(_id) {
    return QuoteModel.update({
      _id,
    }, {
      $inc: {
        votes: 1,
      },
    }).then(() => {
      return QuoteModel.findOne({ _id }).populate('author').exec();
    });
  }
  downVote(_id) {
    return QuoteModel.update({
      _id,
    }, {
      $inc: {
        votes: -1,
      },
    }).then(() => {
      return QuoteModel.findOne({ _id }).populate('author').exec();
    });
  }
}

export class Authors {
  insert(author) {
    return new AuthorModel({
      name: author.name,
    }).save();
  }
  findOrInsert({ authorName }) {
    return AuthorModel.findOne({
      name: authorName,
    }).then((author) => {
      if (author) {
        return Promise.resolve(author);
      }

      return this.insert({ name: authorName });
    });
  }
}
