import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { createDatabase } from './db.js';
import { createBookmarksRepository } from './repositories/bookmarks.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnvPath = path.resolve(currentDirectory, '../../.env');

dotenv.config({ path: repoRootEnvPath });

const database = createDatabase();
const repository = createBookmarksRepository(database);
const app = buildApp({
  repository,
  logger: true
});

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

try {
  await app.listen({
    host: '0.0.0.0',
    port
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
