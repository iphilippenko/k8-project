import Fastify from 'fastify';
import cors from '@fastify/cors';

export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.hostname);
  } catch {
    return false;
  }
}

function normalizeTitle(title) {
  if (typeof title !== 'string') {
    return null;
  }

  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildApp({ repository, logger = false } = {}) {
  if (!repository) {
    throw new Error('Repository is required');
  }

  const app = Fastify({ logger });

  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  });

  app.get('/health', async () => ({
    status: 'ok'
  }));

  app.get('/ready', async (_, reply) => {
    const readiness = await repository.checkConnection();

    if (!readiness.ok) {
      return reply.code(503).send({
        status: 'not-ready',
        reason: readiness.reason
      });
    }

    return {
      status: 'ready'
    };
  });

  app.get('/bookmarks', async (_, reply) => {
    try {
      return await repository.listBookmarks();
    } catch (error) {
      reqLog(app, error);
      return reply.code(500).send({ message: 'Failed to load bookmarks' });
    }
  });

  app.post('/bookmarks', async (request, reply) => {
    const { link, title } = request.body ?? {};
    const normalizedLink = typeof link === 'string' ? link.trim() : '';

    if (!normalizedLink) {
      return reply.code(400).send({ message: 'Link is required' });
    }

    if (!isValidUrl(normalizedLink)) {
      return reply.code(400).send({ message: 'Link must be a valid URL' });
    }

    try {
      const bookmark = await repository.createBookmark({
        link: normalizedLink,
        title: normalizeTitle(title)
      });

      return reply.code(201).send(bookmark);
    } catch (error) {
      reqLog(app, error);
      return reply.code(500).send({ message: 'Failed to create bookmark' });
    }
  });

  app.delete('/bookmarks/:id', async (request, reply) => {
    const { id } = request.params;

    if (!/^\d+$/.test(id)) {
      return reply.code(400).send({ message: 'Bookmark id must be numeric' });
    }

    try {
      const deleted = await repository.deleteBookmark(id);

      if (!deleted) {
        return reply.code(404).send({ message: 'Bookmark not found' });
      }

      return reply.code(204).send();
    } catch (error) {
      reqLog(app, error);
      return reply.code(500).send({ message: 'Failed to delete bookmark' });
    }
  });

  app.addHook('onClose', async () => {
    await repository.close();
  });

  return app;
}

function reqLog(app, error) {
  app.log.error(error);
}
