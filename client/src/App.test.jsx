import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function jsonResponse(body, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

beforeEach(() => {
  global.fetch = vi.fn((input, init = {}) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init.method ?? 'GET';

    if (url.endsWith('/bookmarks') && method === 'GET') {
      return jsonResponse([
        {
          id: '1',
          link: 'https://example.com',
          title: 'Example',
          createdAt: '2026-05-21T18:00:00.000Z'
        }
      ]);
    }

    if (url.endsWith('/bookmarks') && method === 'POST') {
      const payload = JSON.parse(init.body);
      return jsonResponse({
        id: '2',
        link: payload.link,
        title: payload.title ?? null,
        createdAt: '2026-05-21T19:00:00.000Z'
      }, 201);
    }

    if (url.endsWith('/bookmarks/1') && method === 'DELETE') {
      return Promise.resolve(new Response(null, { status: 204 }));
    }

    return jsonResponse({ message: 'Unexpected request' }, 500);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('loads and displays saved bookmarks with date and delete action', async () => {
  render(<App />);

  expect(await screen.findByText('Example')).toBeInTheDocument();
  expect(screen.getByText(/Added/)).toBeInTheDocument();

  const item = screen.getByRole('listitem');
  expect(within(item).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
});

test('requires a link before bookmark creation', async () => {
  const user = userEvent.setup();
  render(<App />);

  await screen.findByText('Example');
  await user.click(screen.getByRole('button', { name: 'Add bookmark' }));

  expect(screen.getByText('Link is required')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('clears the form after a successful bookmark add', async () => {
  const user = userEvent.setup();
  render(<App />);

  await screen.findByText('Example');

  const linkInput = screen.getByLabelText('Link');
  const titleInput = screen.getByLabelText('Title');

  await user.type(linkInput, 'https://openai.com');
  await user.type(titleInput, 'OpenAI');
  await user.click(screen.getByRole('button', { name: 'Add bookmark' }));

  await waitFor(() => {
    expect(linkInput).toHaveValue('');
    expect(titleInput).toHaveValue('');
  });

  expect(screen.getByText('OpenAI')).toBeInTheDocument();
});

test('removes a bookmark after delete without confirmation flow', async () => {
  const user = userEvent.setup();
  render(<App />);

  await screen.findByText('Example');
  await user.click(screen.getByRole('button', { name: 'Delete' }));

  await waitFor(() => {
    expect(screen.queryByText('Example')).not.toBeInTheDocument();
  });
});
