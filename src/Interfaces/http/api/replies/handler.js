const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.softDeleteReplyHandler = this.softDeleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const { commentId } = request.params;
    const useCasePayload = {
      content: request.payload.content,
      threadId,
      commentId,
      owner,
    };
    const addedReply = await replyUseCase.addReplyOnThreadComment(
      useCasePayload,
    );
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async softDeleteReplyHandler(request, h) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const replyId = request.params.id;
    const useCasePayload = {
      threadId,
      commentId,
      replyId,
      owner,
    };
    await replyUseCase.softDeleteReply(useCasePayload);
    const response = h.response({
      status: 'success',
    });

    return response;
  }
}

module.exports = ReplyHandler;
