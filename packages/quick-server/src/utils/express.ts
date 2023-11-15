import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

interface CreateExpressAppOptions {
  name?: string;
  port?: string | number;
  healthRoute?: boolean;
}

export function createExpressApp(options?: CreateExpressAppOptions) {
  const app = express();

  // app configuration
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  if (options?.port) {
    app.set('port', options.port);
  }

  app.get('/healthz', createHealthzRoute(options?.name));

  return app;
}

export function createHealthzRoute(name?: string) {
  return function (_req, res, _next) {
    return res.status(200).json({
      name,
      timestamp: new Date().toISOString(),
      status: 'ok',
    });
  };
}
