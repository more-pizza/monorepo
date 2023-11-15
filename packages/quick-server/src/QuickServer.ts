import http from 'http';
import pino from 'pino';
import express from 'express';
import mongoose from 'mongoose';

import { createExpressApp } from './utils/express';
import { createLogger } from './utils/logger';
import { BaseService } from './BaseService';

const DEFAULT_PORT = '8080';
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017';

export interface QuickServerOptions {
  name?: string;
  services?: BaseService[];
  options?: {
    port?: string;
    mongoUri?: string;
  };
}

export class QuickServer {
  public app: express.Application;
  public logger: pino.Logger;
  public services?: BaseService[];

  public options: {
    name?: string;
    port?: string;
    mongoUri?: string;
  };

  private httpServer: http.Server;

  constructor(args?: QuickServerOptions) {
    const options = args?.options || {};
    this.options = {
      name: args?.name || process.env.APP_NAME,
      mongoUri: options?.mongoUri || process.env.MONGO_URI || DEFAULT_MONGO_URI,
      port: options?.port || process.env.PORT || DEFAULT_PORT,
    };

    this.services = args?.services || [];
    this.logger = createLogger();
    this.app = createExpressApp({ name: this.options.name, port: this.options.port });
  }

  public async start() {
    this.logger.info('attempting to starting server');

    this.logger.info('connecting to mongodb');
    mongoose.set('strictQuery', false);
    await mongoose.connect(this.options.mongoUri as string);
    this.logger.info('connected to mongodb');

    this.logger.info('starting http server');
    this.httpServer = http.createServer(this.app);

    // start all the services
    for (const service of this.services || []) {
      await service.start({
        logger: this.logger,
        app: this.app,
        httpServer: this.httpServer,
      });
    }

    this.httpServer.listen(this.options.port, () => {
      this.logger.info(`Server is running on port ${this.options.port}`);
    });
  }

  public addService(service: BaseService) {
    if (!this.services) {
      this.services = [];
    }
    this.services.push(service);
  }
}
