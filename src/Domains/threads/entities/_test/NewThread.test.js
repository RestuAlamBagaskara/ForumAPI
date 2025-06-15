const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Redemption Arc',
      body: 'lorem ipsum dolor sit amet',
    };

    expect(() => new NewThread(payload)).toThrow(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'Redemption Arc',
      body: 123,
      owner: 'user-222',
    };

    expect(() => new NewThread(payload)).toThrow(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create new thread object correctly', () => {
    const payload = {
      title: 'Redemption Arc',
      body: 'lorem ipsum dolor sit amet',
      owner: 'user-333',
    };

    const { title, body, owner } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
