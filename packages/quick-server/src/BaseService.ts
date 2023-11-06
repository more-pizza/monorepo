import pino from 'pino';
import express from 'express';
import http from 'http';

export interface BaseServiceStartParams {
  logger: pino.Logger;
  app: express.Application;
  httpServer: http.Server;
}

export interface BaseService {
  start(params: BaseServiceStartParams): Promise<void>;
}
