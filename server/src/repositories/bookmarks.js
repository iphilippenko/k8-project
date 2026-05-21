function mapBookmark(row) {
  return {
    id: row.id,
    link: row.link,
    title: row.title,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

export function createBookmarksRepository(database) {
  return {
    async listBookmarks() {
      const result = await database.query(
        `SELECT id, link, title, created_at
         FROM bookmarks
         ORDER BY created_at DESC, id DESC`
      );

      return result.rows.map(mapBookmark);
    },

    async createBookmark({ link, title }) {
      const result = await database.query(
        `INSERT INTO bookmarks (link, title)
         VALUES ($1, $2)
         RETURNING id, link, title, created_at`,
        [link, title]
      );

      return mapBookmark(result.rows[0]);
    },

    async deleteBookmark(id) {
      const result = await database.query('DELETE FROM bookmarks WHERE id = $1', [id]);
      return result.rowCount > 0;
    },

    async checkConnection() {
      return database.checkConnection();
    },

    async close() {
      await database.close();
    }
  };
}
