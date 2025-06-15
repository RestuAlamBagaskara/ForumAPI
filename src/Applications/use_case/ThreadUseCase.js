const NewThread = require('../../Domains/threads/entities/NewThread');
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const ReplyDetails = require('../../Domains/replies/entities/ReplyDetails');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async createNewThread(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.createNewThread(newThread);
  }

  async getThreadDetailsById(useCasePayload) {
    const { threadId } = new ThreadDetails(useCasePayload);
    await this._threadRepository.threadIsExist(threadId);

    const getThreadDetailsById = await this._threadRepository.getThreadDetailsById(threadId);
    const getCommentsByThreadId = await this._commentRepository.getCommentsByThreadId(threadId);
    const getRepliesByThreadId = await this._replyRepository.getRepliesByThreadId(threadId);

    const commentsWithReplies = getCommentsByThreadId
      .filter((comment) => comment.thread_id === threadId)
      .map((comment) => {
        const replies = getRepliesByThreadId
          .filter((reply) => reply.comment_id === comment.id)
          .map((reply) => ({
            ...new ReplyDetails({ replies: [reply] }).replies[0],
          }));

        return {
          ...new CommentDetails({ comments: [comment] }).comments[0],
          replies,
        };
      });

    return {
      thread: {
        ...getThreadDetailsById,
        comments: commentsWithReplies,
      },
    };
  }
}

module.exports = ThreadUseCase;
