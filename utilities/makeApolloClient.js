/* File: makeApolloClient.js */

import addGraphQLSubscriptions from './addGraphQLSubscriptions';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { Client } from 'subscriptions-transport-ws';

// creates a subscription ready Apollo Client instance
// Note that scaphldUrl expects the url without the http:// or wss://
function makeApolloClient(graphqlUrl) {
  let networkInterface = createNetworkInterface({ uri: graphqlUrl });
  networkInterface.use([{
    applyMiddleware(req, next) {
      // Easy way to add authorization headers for every request
      if (!req.options.headers) {
        req.options.headers = {};  // Create the header object if needed.
      }
      if (localStorage.getItem('scaphold_user_token')) {
        // assumes we have logged in and stored the returned user token in local storage
        req.options.headers.Authorization = `Bearer ${localStorage.getItem('scaphold_user_token')}`;
      }
      next();
    },
  }]);
  try {
    const split = graphqlUrl.split('//')[1];
    const websocketUrl = `wss://${split}`;
    const wsClient = new Client(websocketUrl);
    networkInterface = addGraphQLSubscriptions(networkInterface, wsClient);
  } catch (e) {
    console.log('Error creating websocket connection. Please make sure your graphqlUrl contains a prefix (e.g. https://)');
  }

  const clientGraphql = new ApolloClient({
    networkInterface,
    initialState: {},
  });
  return clientGraphql;
}

export default makeApolloClient;
/* End of File: makeApolloClient.js */
