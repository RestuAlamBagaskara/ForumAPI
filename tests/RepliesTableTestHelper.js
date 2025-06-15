/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReplyOnThreadComment({
    id = 'reply-111',
    threadId = 'thread-111',
    commentId = 'comment-111',
    content = 'lorem ipsum dolor sit amet',
    owner = 'user-111',
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, threadId, commentId, content, owner, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async isDeleted(id) {
    const query = {
      text: 'SELECT deleted_at FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const deletedAt = result.rows[0].deleted_at;
    return deletedAt;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
