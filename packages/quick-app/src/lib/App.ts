import http from 'http';
import express, { Application as ExpressApplication } from 'express';
import mongoose from 'mongoose';
import pino, { BaseLogger as PinoBaseLogger } from 'pino';
import { createExpressApp } from '../utils/express';

const DEFAULT_PORT = '8080';
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017';

export interface QuickAppArgs {
  router: express.Router;
}

export interface QuickAppOptions {
  port?: string;
  mongoUri?: string;
}

export class QuickApp {
  public logger: PinoBaseLogger;
  public httpServer: http.Server;
  public expressApp: ExpressApplication;
  public expressRouter: express.Application;

  public options: {
    port?: string;
    mongoUri?: string;
  };

  constructor(args: QuickAppArgs, options?: QuickAppOptions) {
    this.expressRouter = args.router;

    this.options = {
      mongoUri: options?.mongoUri || process.env.MONGO_URI || DEFAULT_MONGO_URI,
      port: options?.port || process.env.PORT || DEFAULT_PORT,
    };

    this.init();
  }

  public init() {
    this.logger = pino({ transport: { target: 'pino-pretty', options: { colorize: true } } });
    this.expressApp = createExpressApp({ port: this.options.port });
  }

  private validateForStart() {
    if (!this.expressRouter) {
      throw new Error('Express router not set');
    }
  }

  public async start() {
    this.logger.info('attempting to starting server');
    this.validateForStart();

    this.logger.info('connecting to mongodb');
    mongoose.set('strictQuery', false);
    await mongoose.connect(this.options.mongoUri as string);
    this.logger.info('connected to mongodb');

    this.logger.info('starting http server');
    this.httpServer = http.createServer(this.expressApp);
    this.httpServer.listen(this.options.port, () => {
      this.logger.info(`Server is running on port ${this.options.port}`);
    });
  }

  public setExpressRouter(router: express.Router) {
    this.expressRouter = router;
  }
}
