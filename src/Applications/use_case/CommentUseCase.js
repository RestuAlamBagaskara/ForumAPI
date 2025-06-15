const AddComment = require('../../Domains/comments/entities/AddComment');

class CommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addCommentOnThread(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.threadIsExist(threadId);
    const newComment = new AddComment(useCasePayload);
    return this._commentRepository.addCommentOnThread(newComment);
  }

  async softDeleteComment(useCasePayload) {
    this._validateDeletePayload(useCasePayload);
    const { threadId, commentId, owner } = useCasePayload;
    await this._threadRepository.threadIsExist(threadId);
    await this._commentRepository.commentIsExist(commentId);
    await this._commentRepository.verifyOwnership(commentId, owner);
    await this._commentRepository.softDeleteComment(commentId);
  }

  _validateDeletePayload(payload) {
    const { threadId, commentId, owner } = payload;

    if (!threadId || !commentId || !owner) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error(
        'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    }
  }
}

module.exports = CommentUseCase;
