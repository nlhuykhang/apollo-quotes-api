import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
// import { pubsub } from './subscriptions';

const rootSchema = [`

type Query {
  test(text: String = "World"): String!
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
  Query: {
    test(root, { text }) {
      return `Hello ${text}`;
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
