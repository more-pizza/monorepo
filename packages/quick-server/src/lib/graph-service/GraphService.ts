import http from 'http';
import gql from 'graphql-tag';

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';

import { GraphDomain } from './GraphDomain';
import { BaseService, BaseServiceStartParams } from '../../BaseService';
import { log } from 'console';

export class GraphService implements BaseService {
  public domains: GraphDomain[];

  constructor() {
    this.domains = [this.createRootDomain()];
  }

  public addDomain(domain: GraphDomain) {
    this.domains.push(domain);
  }

  public async start(params: BaseServiceStartParams) {
    const { logger, app, httpServer } = params;
    const serviceLogger = logger.child({ service: 'GraphService' });
    serviceLogger.info('starting...');
    const server = this.createServer({ httpServer });
    await server.start();
    app.use('/graphql', expressMiddleware(server));
    serviceLogger.info('started - mounted to /graphql');
  }

  private createServer(params: { httpServer: http.Server }) {
    const { httpServer } = params;
    const server = new ApolloServer(this.getServerProps());
    server.addPlugin(ApolloServerPluginDrainHttpServer({ httpServer }));
    return server;
  }

  private createRootDomain() {
    const typeDef = gql`
      type Query {
        root: Boolean
      }
      type Mutation {
        root: Boolean
      }
    `;

    const resolver = {
      Query: { root: () => true },
      Mutation: { root: () => true },
    };

    return new GraphDomain({ typeDef, resolver });
  }

  private getTypeDefs() {
    return this.domains.map((domain) => domain.typeDef);
  }

  private getResolvers() {
    return this.domains.map((domain) => domain.resolver);
  }

  private getServerProps() {
    return {
      introspection: true,
      csrfPrevention: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })],
      typeDefs: this.getTypeDefs(),
      resolvers: this.getResolvers(),
    };
  }
}
