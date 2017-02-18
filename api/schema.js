import { merge, flatten, shuffle } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
// import { pubsub } from './subscriptions';

const rootSchema = [`

type Author {
  id: String
  name: String!
  quotes: [Quote]!
}

type Quote {
  id: String
  content: String!
  author: Author
  votes: Int
}

type Collection {
  id: String
  name: String
  quotes: [Quote!]!
}

type Query {
  test(text: String = "World"): String!
  randomFeed: [Quote]
}

type Mutation {
  submitTest(input: Int!): Int!
}

schema {
  query: Query
  mutation: Mutation
}

`];

const rootResolvers = {
  Author: {
    // eslint-disable-next-line
    quotes({ id }, args, conext, info) {
      if (id) {
        // TODO: access db
      }
      return [];
    },
  },
  Quote: {
    // eslint-disable-next-line no-unused-vars
    author({ id, authorName }, _, context) {
      if (id) {
        return {
          name: 'has_id',
        };
      }

      return {
        name: authorName,
      };
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
  },
  Mutation: {
    submitTest(root, { input }) {
      return input + 10;
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
