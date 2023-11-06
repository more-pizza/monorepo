const gql = require('graphql-tag');
const { QuickServer, GraphService, GraphDomain } = require('../dist/index');

const userDomain = new GraphDomain({
  typeDef: gql`
    type User {
      id: ID!
      name: String!
    }

    extend type Query {
      me: User!
    }
  `,
  resolver: {
    Query: {
      me: () => ({ id: 1, name: 'me' }),
    },
  },
});

const graphService = new GraphService();
graphService.addDomain(userDomain);

const app = new QuickServer({ services: [graphService] });

async function main() {
  await app.start();
}

main();
