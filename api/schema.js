import { merge, flatten, shuffle } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
// import { pubsub } from './subscriptions';

const rootSchema = [`

type Author {
  id: ID
  name: String!
  quotes: [Quote]!
}

type Quote {
  id: ID
  content: String!
  author: Author
  votes: Int
}

type Collection {
  id: ID
  name: String
  quotes: [Quote]!
}

type Query {
  test(text: String = "World"): String!
  randomFeed: [Quote]
  getSavedQuotes: [Quote]!
  getAllColections: [Collection]!
  getCollectionById(collectionId: ID!): Collection
}

input QuoteInput {
  content: String!
  authorName: String
}

type Mutation {
  submitTest(input: Int!): Int!
  saveOneQuote(quoteInput: QuoteInput!): Quote
  addOneCollection(name: String!): Collection
  addQuoteToCollection(quoteId: ID!, collectionId: ID!): Collection
  upVote(quoteId: ID!): Quote
  downVote(quoteId: ID!): Quote
}

schema {
  query: Query
  mutation: Mutation
}

`];

const rootResolvers = {
  Author: {
    // eslint-disable-next-line
    quotes({ _id }, args, context, info) {
      if (_id) {
        // TODO: access db
        return context.Quotes.getAllQuoteByAuthorId(_id);
      }
      return [];
    },
  },
  Quote: {
    // eslint-disable-next-line no-unused-vars
    author({ authorName, author }, _, context) {
      if (typeof author === 'object') {
        return author;
      }

      return {
        name: authorName,
      };
    },
  },
  Collection: {
    quotes({ _id }, args, context) {
      return context.Collections.getAllQuoteByCollectionId({
        _id,
      });
    },
  },
  Query: {
    test(root, { text }) {
      return `Hello ${text}`;
    },
    randomFeed(root, args, context) {
      return Promise.all([
        context.RandomQuotes.getFiveQuotes(),
        context.StormQuotes.getFiveQuotes(),
      ]
      ).then((re) => {
        return shuffle(flatten(re));
      });
    },
    getSavedQuotes(root, args, context) {
      return context.Quotes.findAll();
    },
    getAllColections(root, args, context) {
      return context.Collections.findAll();
    },
    getCollectionById(root, { collectionId }, context) {
      return context.Collections.getCollectionById({ collectionId });
    },
  },
  Mutation: {
    submitTest(root, { input }) {
      return input + 10;
    },
    saveOneQuote(root, { quoteInput }, context) {
      const {
        authorName,
        content,
      } = quoteInput;

      return context.Authors.findOrInsert({
        authorName,
      }).then((author) => {
        return context.Quotes.insert({
          content,
          authorId: author._id,
        });
      }).then((quote) => {
        return quote;
      });
    },
    addQuoteToCollection(root, { quoteId, collectionId }, context) {
      return context.Collections.addQuoteToCollection({
        quoteId,
        collectionId,
      });
    },
    addOneCollection(root, { name }, context) {
      return context.Collections.insert({ name });
    },
    upVote(root, { quoteId }, context) {
      return context.Quotes.upVote(quoteId);
    },
    downVote(root, { quoteId }, context) {
      return context.Quotes.downVote(quoteId);
    },
  },
  // Subscription: {},
};

const schema = [...rootSchema];
const resolvers = merge(rootResolvers);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export default executableSchema;
