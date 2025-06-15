/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addCommentOnThread({
    id = 'comment-111',
    threadId = 'thread-111',
    content = 'lorem ipsum dolor sit amet',
    owner = 'user-111',
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async isDeleted(id) {
    const query = {
      text: 'SELECT deleted_at FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const deletedAt = result.rows[0].deleted_at;
    return deletedAt;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
