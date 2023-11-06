import pino from 'pino';

export function createLogger() {
  return pino({ transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } });
}
