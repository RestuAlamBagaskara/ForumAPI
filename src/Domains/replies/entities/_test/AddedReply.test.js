const AddedReply = require('../AddedReply');

describe('AddedReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-111',
      owner: 'user-111',
    };

    expect(() => new AddedReply(payload)).toThrow(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'reply-222',
      content: 872,
      owner: 'user-222',
    };

    expect(() => new AddedReply(payload)).toThrow(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create new added reply object correctly', () => {
    const payload = {
      id: 'reply-333',
      content: 'lorem ipsum dolor sit amet',
      owner: 'user-333',
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
