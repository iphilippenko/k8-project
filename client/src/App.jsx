import { useEffect, useState } from 'react';

const initialForm = {
  link: '',
  title: ''
};

const runtimeConfig = window.__APP_CONFIG__ ?? {};
const apiBaseUrl =
  runtimeConfig.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000';
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function formatDate(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return dateFormatter.format(parsed);
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return null;
}

export default function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadBookmarks() {
      try {
        const response = await fetch(`${apiBaseUrl}/bookmarks`);
        const payload = await parseResponse(response);

        if (!response.ok) {
          throw new Error(payload?.message ?? 'Failed to load bookmarks');
        }

        if (active) {
          setBookmarks(payload);
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookmarks();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.link.trim()) {
      setError('Link is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          link: form.link.trim(),
          title: form.title.trim() || undefined
        })
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to create bookmark');
      }

      setBookmarks((current) => [payload, ...current]);
      setForm(initialForm);
      setError('');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${apiBaseUrl}/bookmarks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const payload = await parseResponse(response);
        throw new Error(payload?.message ?? 'Failed to delete bookmark');
      }

      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));
      setError('');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="hero">
          <p className="eyebrow">Saved links</p>
          <h1>Bookmark board</h1>
          <p className="lede">Keep a short, durable list of links worth returning to.</p>
        </div>

        <div className="content-grid">
          <form className="bookmark-form" noValidate onSubmit={handleSubmit}>
            <label className="field">
              <span>Link</span>
              <input
                name="link"
                type="url"
                placeholder="https://example.com"
                required
                value={form.link}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Title</span>
              <input
                name="title"
                type="text"
                placeholder="Optional label"
                value={form.title}
                onChange={handleChange}
              />
            </label>

            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Saving...' : 'Add bookmark'}
            </button>
          </form>

          <section className="bookmarks-section" aria-live="polite">
            <div className="section-header">
              <h2>Bookmarks</h2>
              <span>{bookmarks.length} saved</span>
            </div>

            {error ? <p className="status-message error-message">{error}</p> : null}
            {loading ? <p className="status-message">Loading bookmarks...</p> : null}

            {!loading && bookmarks.length === 0 ? (
              <p className="status-message">No bookmarks yet.</p>
            ) : null}

            <ul className="bookmark-list">
              {bookmarks.map((bookmark) => (
                <li className="bookmark-item" key={bookmark.id}>
                  <div className="bookmark-copy">
                    {bookmark.title ? <h3>{bookmark.title}</h3> : null}
                    <a href={bookmark.link} rel="noreferrer" target="_blank">
                      {bookmark.link}
                    </a>
                    <p>Added {formatDate(bookmark.createdAt)}</p>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(bookmark.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
