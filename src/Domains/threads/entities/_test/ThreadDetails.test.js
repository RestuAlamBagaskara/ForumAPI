const ThreadDetails = require('../ThreadDetails');

describe('ThreadDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new ThreadDetails(payload)).toThrow(
      'THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: 222,
    };

    expect(() => new ThreadDetails(payload)).toThrow(
      'THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ThreadDetails object correctly', () => {
    const payload = {
      threadId: 'thread-333',
    };

    const { threadId } = new ThreadDetails(payload);

    expect(threadId).toEqual(payload.threadId);
  });
});
