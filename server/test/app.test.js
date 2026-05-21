import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/app.js';

function createRepository({ ready = true, bookmarks = [] } = {}) {
  let sequence = bookmarks.length + 1;
  const state = [...bookmarks];

  return {
    async checkConnection() {
      return ready ? { ok: true } : { ok: false, reason: 'database unavailable' };
    },

    async listBookmarks() {
      return state;
    },

    async createBookmark({ link, title }) {
      const bookmark = {
        id: String(sequence++),
        link,
        title,
        createdAt: '2026-05-21T18:00:00.000Z'
      };

      state.unshift(bookmark);
      return bookmark;
    },

    async deleteBookmark(id) {
      const index = state.findIndex((bookmark) => bookmark.id === id);

      if (index === -1) {
        return false;
      }

      state.splice(index, 1);
      return true;
    },

    async close() {}
  };
}

test('health and readiness endpoints report expected status', async () => {
  const healthyApp = buildApp({ repository: createRepository() });
  const readyResponse = await healthyApp.inject({ method: 'GET', url: '/ready' });
  const healthResponse = await healthyApp.inject({ method: 'GET', url: '/health' });

  assert.equal(healthResponse.statusCode, 200);
  assert.deepEqual(healthResponse.json(), { status: 'ok' });
  assert.equal(readyResponse.statusCode, 200);
  assert.deepEqual(readyResponse.json(), { status: 'ready' });

  await healthyApp.close();

  const unhealthyApp = buildApp({ repository: createRepository({ ready: false }) });
  const notReadyResponse = await unhealthyApp.inject({ method: 'GET', url: '/ready' });

  assert.equal(notReadyResponse.statusCode, 503);
  assert.deepEqual(notReadyResponse.json(), {
    status: 'not-ready',
    reason: 'database unavailable'
  });

  await unhealthyApp.close();
});

test('bookmarks can be listed, created, and deleted', async () => {
  const app = buildApp({
    repository: createRepository({
      bookmarks: [
        {
          id: '1',
          link: 'https://example.com',
          title: 'Example',
          createdAt: '2026-05-20T18:00:00.000Z'
        }
      ]
    })
  });

  const listResponse = await app.inject({ method: 'GET', url: '/bookmarks' });
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().length, 1);

  const createResponse = await app.inject({
    method: 'POST',
    url: '/bookmarks',
    payload: {
      link: 'https://openai.com',
      title: 'OpenAI'
    }
  });

  assert.equal(createResponse.statusCode, 201);
  assert.equal(createResponse.json().title, 'OpenAI');

  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/bookmarks/${createResponse.json().id}`
  });

  assert.equal(deleteResponse.statusCode, 204);

  await app.close();
});

test('bookmark creation validates a required and well-formed link', async () => {
  const app = buildApp({ repository: createRepository() });

  const missingLinkResponse = await app.inject({
    method: 'POST',
    url: '/bookmarks',
    payload: {
      title: 'No link'
    }
  });

  assert.equal(missingLinkResponse.statusCode, 400);
  assert.deepEqual(missingLinkResponse.json(), { message: 'Link is required' });

  const invalidLinkResponse = await app.inject({
    method: 'POST',
    url: '/bookmarks',
    payload: {
      link: 'not-a-url'
    }
  });

  assert.equal(invalidLinkResponse.statusCode, 400);
  assert.deepEqual(invalidLinkResponse.json(), { message: 'Link must be a valid URL' });

  await app.close();
});
