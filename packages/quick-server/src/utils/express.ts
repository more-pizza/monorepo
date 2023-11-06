import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export function createExpressApp(options?: { port?: string | number; healthRoute?: boolean }) {
  const app = express();

  // app configuration
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  if (options?.port) {
    app.set('port', options.port);
  }

  app.get('/healthz', createHealthzRoute());

  return app;
}

export function createHealthzRoute() {
  return function (_req, res, _next) {
    return res.status(200).json({ timestamp: new Date().toISOString(), status: 'ok' });
  };
}
