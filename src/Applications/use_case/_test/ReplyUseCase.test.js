const ReplyUseCase = require('../ReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('ReplyUseCase', () => {
  it('should orchestrating the addReplyOnThreadComment action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-111',
      commentId: 'comment-111',
      content: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      owner: 'user-111',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-111',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.threadIsExist = jest.fn().mockResolvedValue();
    mockCommentRepository.commentIsExist = jest.fn().mockResolvedValue();
    mockReplyRepository.addReplyOnThreadComment = jest
      .fn()
      .mockResolvedValue(mockAddedReply);

    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
    const addedReply = await replyUseCase.addReplyOnThreadComment(
      useCasePayload,
    );

    expect(mockThreadRepository.threadIsExist).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.commentIsExist).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-111',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    );
    expect(mockReplyRepository.addReplyOnThreadComment).toHaveBeenCalledWith(
      new AddReply({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    );
  });

  it('should throw error if softDeleteReply payload not contain thread id and comment id', async () => {
    const useCasePayload = {};
    const replyUseCase = new ReplyUseCase({});

    await expect(replyUseCase.softDeleteReply(useCasePayload)).rejects.toThrow(
      'DELETE_REPLY_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD',
    );
  });

  it('should throw error if softDeleteReply payload not typed as string', async () => {
    const useCasePayload = {
      threadId: 111,
      commentId: 111,
      replyId: 111,
      owner: 111,
    };
    const replyUseCase = new ReplyUseCase({});
    await expect(replyUseCase.softDeleteReply(useCasePayload)).rejects.toThrow(
      'DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrating the softDeleteReply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-222',
      commentId: 'comment-222',
      replyId: 'reply-222',
      owner: 'user-222',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.threadIsExist = jest.fn().mockResolvedValue();
    mockCommentRepository.commentIsExist = jest.fn().mockResolvedValue();
    mockReplyRepository.replyIsExist = jest.fn().mockResolvedValue();
    mockReplyRepository.verifyOwnership = jest.fn().mockResolvedValue();
    mockReplyRepository.softDeleteReply = jest.fn().mockResolvedValue();

    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await replyUseCase.softDeleteReply(useCasePayload);

    expect(mockThreadRepository.threadIsExist).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.commentIsExist).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.replyIsExist).toHaveBeenCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.verifyOwnership).toHaveBeenCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner,
    );
    expect(mockReplyRepository.softDeleteReply).toHaveBeenCalledWith(
      useCasePayload.replyId,
    );
  });
});
