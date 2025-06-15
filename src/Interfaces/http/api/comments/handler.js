const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.softDeleteCommentHandler = this.softDeleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const useCasePayload = {
      content: request.payload.content,
      threadId,
      owner,
    };
    const addedComment = await commentUseCase.addCommentOnThread(
      useCasePayload,
    );
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async softDeleteCommentHandler(request, h) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const commentId = request.params.id;
    const useCasePayload = {
      threadId,
      commentId,
      owner,
    };
    await commentUseCase.softDeleteComment(useCasePayload);

    const response = h.response({
      status: 'success',
    });
    return response;
  }
}

module.exports = CommentHandler;
