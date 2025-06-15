const AddComment = require('../AddComment');

describe('AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      owner: 'user-111',
      threadId: 'thread-111',
    };

    expect(() => new AddComment(payload)).toThrow(
      'COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 'user-222',
      threadId: 'thread-222',
      content: 982,
    };

    expect(() => new AddComment(payload)).toThrow(
      'COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create new comment object correctly', () => {
    const payload = {
      owner: 'user-333',
      threadId: 'thread-333',
      content: 'lorem ipsum dolor sit amet',
    };

    const { owner, threadId, content } = new AddComment(payload);

    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
  });
});
