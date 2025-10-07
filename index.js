import { fileURLToPath } from 'node:url';
import path from 'path';
import dns from 'node:dns';

import open from 'open';
import fastifyFactory from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import staticPlugin from '@fastify/static';

import { ssurgo, mapunits, polygon, vegspec } from './ssurgo.js';

dns.setDefaultResultOrder('ipv4first');

process.on('uncaughtException', (err) => {
  console.error(err);
  console.log('Node NOT Exiting...');
});

const app = fastifyFactory({
  trustProxy: true,
  logger: true,
  bodyLimit: 50 * 1024 * 1024,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  

// Plugins
await app.register(cors);
await app.register(formbody);       // x-www-form-urlencoded

// Static assets (public at '/')
await app.register(staticPlugin, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
  index: ['index.html'],
  etag: true,
  lastModified: true,
  serveDotFiles: true,
});

// Error handling
app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  reply.code(500).send('Something broke!');
});

// Routes
app.get('/', ssurgo);
app.all('/polygon', polygon);
app.all('/mapunits', mapunits);
app.all('/vegspec', vegspec);

// Start
app.listen({ port: 80, host: '0.0.0.0' }).then(() => {
  if (process.argv.includes('dev')) {
    open('http://localhost').catch(() => {});
  }
  app.log.info('Running!');
}).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
