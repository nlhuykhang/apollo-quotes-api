import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { invert } from 'lodash';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';

// XXX for socket
// import { createServer } from 'http';
// import { SubscriptionServer } from 'subscriptions-transport-ws';
// import { subscriptionManager } from './subscriptions';

import schema from './schema';
import queryMap from '../extracted_queries.json';
import config from './config';

const PORT = 3010;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const invertedMap = invert(queryMap);

app.use('/graphql', (req, res, next) => {
  if (config.persistedQueries) {
    // eslint-disable-next-line no-param-reassign
    req.body.query = invertedMap[req.body.id];
  }
  next();
});

// set up passport login

app.use('/graphql', graphqlExpress((req) => {
  const query = req.query.query || req.body.query;

  if (query && query.length > 2000) {
    throw new Error('Query too large.');
  }

  let user;
  if (req.user) {
    user = req.user;
  }

  // TODO: init connector per query

  return {
    schema,
    context: {
      user,
    },
  };
}));

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`API Server is now running at http://localhost:${PORT}`));


// XXX: WebSocket server for subscriptions
// const websocketServer = createServer((request, response) => {
//   response.writeHead(404);
//   response.end();
// });
//
// websocketServer.listen(WS_PORT, () => console.log( // eslint-disable-line no-console
//   `Websocket Server is now running on http://localhost:${WS_PORT}`
// ));
//
// // eslint-disable-next-line
// new SubscriptionServer(
//   {
//     subscriptionManager,
//
//     // the obSubscribe function is called for every new subscription
//     // and we use it to set the GraphQL context for this subscription
//     onSubscribe: (msg, params) => {
//       const gitHubConnector = new GitHubConnector({
//         clientId: GITHUB_CLIENT_ID,
//         clientSecret: GITHUB_CLIENT_SECRET,
//       });
//       return Object.assign({}, params, {
//         context: {
//           Repositories: new Repositories({ connector: gitHubConnector }),
//           Users: new Users({ connector: gitHubConnector }),
//           Entries: new Entries(),
//           Comments: new Comments(),
//         },
//       });
//     },
//   },
//   websocketServer
// );
