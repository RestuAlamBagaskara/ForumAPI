const AddReply = require('../AddReply');

describe('AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      owner: 'user-111',
      threadId: 'thread-111',
      commentId: 'comment-111',
    };

    expect(() => new AddReply(payload)).toThrow(
      'REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 'user-222',
      threadId: 'thread-222',
      commentId: 'comment-222',
      content: 222,
    };

    expect(() => new AddReply(payload)).toThrow(
      'REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create new reply object correctly', () => {
    const payload = {
      owner: 'user-333',
      threadId: 'thread-333',
      commentId: 'comment-333',
      content: 'lorem ipsum dolor sit amet',
    };

    const {
      owner, threadId, commentId, content,
    } = new AddReply(payload);

    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(content).toEqual(payload.content);
  });
});
