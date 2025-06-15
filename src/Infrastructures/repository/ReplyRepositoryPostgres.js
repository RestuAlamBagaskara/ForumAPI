const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyOnThreadComment({
    threadId, commentId, content, owner,
  }) {
    const replyId = `reply-${this._idGenerator()}`;
    const timestamp = new Date().toISOString();

    const insertQuery = {
      text: `
        INSERT INTO replies (id, thread_id, comment_id, content, owner, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id, content, owner
      `,
      values: [replyId, threadId, commentId, content, owner, timestamp],
    };

    const { rows } = await this._pool.query(insertQuery);

    return new AddedReply(rows[0]);
  }

  async replyIsExist(replyId) {
    const findQuery = {
      text: 'SELECT 1 FROM replies WHERE id = $1',
      values: [replyId],
    };

    const { rowCount } = await this._pool.query(findQuery);

    if (rowCount === 0) {
      throw new NotFoundError('No replies found');
    }
  }

  async verifyOwnership(replyId, owner) {
    const verifyQuery = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const { rowCount } = await this._pool.query(verifyQuery);

    if (rowCount === 0) {
      throw new AuthorizationError('You can only delete your own replies');
    }
  }

  async softDeleteReply(replyId) {
    const timestamp = new Date().toISOString();
    const deleteQuery = {
      text: 'UPDATE replies SET deleted_at = $2 WHERE id = $1',
      values: [replyId, timestamp],
    };

    await this._pool.query(deleteQuery);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `
        SELECT r.id, r.comment_id, u.username, r.created_at AS date, r.content, r.deleted_at
        FROM replies r
        JOIN users u ON u.id = r.owner
        WHERE r.thread_id = $1
        ORDER BY r.created_at ASC
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = ReplyRepositoryPostgres;
