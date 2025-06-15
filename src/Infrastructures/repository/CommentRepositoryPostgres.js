const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentOnThread({ content, threadId, owner }) {
    const commentId = `comment-${this._idGenerator()}`;
    const timestamp = new Date().toISOString();

    const insertQuery = {
      text: `
        INSERT INTO comments (id, thread_id, content, owner, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, content, owner
      `,
      values: [commentId, threadId, content, owner, timestamp, timestamp],
    };

    const { rows } = await this._pool.query(insertQuery);

    return new AddedComment(rows[0]);
  }

  async commentIsExist(commentId) {
    const findQuery = {
      text: 'SELECT 1 FROM comments WHERE id = $1',
      values: [commentId],
    };

    const { rowCount } = await this._pool.query(findQuery);

    if (rowCount === 0) {
      throw new NotFoundError('No comments found');
    }
  }

  async verifyOwnership(commentId, owner) {
    const verifyQuery = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const { rowCount } = await this._pool.query(verifyQuery);

    if (rowCount === 0) {
      throw new AuthorizationError('You can only delete your own comments');
    }
  }

  async softDeleteComment(commentId) {
    const timestamp = new Date().toISOString();
    const deleteQuery = {
      text: 'UPDATE comments SET deleted_at = $2 WHERE id = $1',
      values: [commentId, timestamp],
    };

    await this._pool.query(deleteQuery);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, c.thread_id, u.username, c.created_at AS date, c.content, c.deleted_at
        FROM comments c
        JOIN users u ON u.id = c.owner
        WHERE c.thread_id = $1
        ORDER BY c.created_at ASC
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
