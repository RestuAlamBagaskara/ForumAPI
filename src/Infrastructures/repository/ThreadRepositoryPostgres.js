const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createNewThread({ title, body, owner }) {
    const threadId = `thread-${this._idGenerator()}`;
    const timestamp = new Date().toISOString();

    const insertQuery = {
      text: `
        INSERT INTO threads (id, title, body, owner, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, owner
      `,
      values: [threadId, title, body, owner, timestamp, timestamp],
    };

    const { rows } = await this._pool.query(insertQuery);

    return new AddedThread(rows[0]);
  }

  async threadIsExist(threadId) {
    const findQuery = {
      text: 'SELECT 1 FROM threads WHERE id = $1',
      values: [threadId],
    };

    const { rowCount } = await this._pool.query(findQuery);

    if (rowCount === 0) {
      throw new NotFoundError('No threads found');
    }
  }

  async getThreadDetailsById(threadId) {
    const detailQuery = {
      text: `
        SELECT t.id, t.title, t.body, t.created_at AS date, u.username
        FROM threads t
        JOIN users u ON u.id = t.owner
        WHERE t.id = $1
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(detailQuery);

    return rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
