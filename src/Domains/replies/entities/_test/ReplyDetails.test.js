const ReplyDetails = require('../ReplyDetails');

describe('ReplyDetails entities', () => {
  it('should create ReplyDetails data correctly', () => {
    const payload = {
      replies: [
        {
          id: 'reply-111',
          username: 'alam',
          date: '2025-01-08T07:22:33.555Z',
          content: 'lorem ipsum',
          deleted_at: '',
        },
        {
          id: 'reply-222',
          username: 'bagas',
          date: '2025-01-08T07:22:33.555Z',
          content: 'deleted',
          deleted_at: '2025-01-08T07:22:33.555Z',
        },
      ],
    };

    const { replies } = new ReplyDetails(payload);

    const expectedReply = [
      {
        id: 'reply-111',
        username: 'alam',
        date: '2025-01-08T07:22:33.555Z',
        content: 'lorem ipsum',
      },
      {
        id: 'reply-222',
        username: 'bagas',
        date: '2025-01-08T07:22:33.555Z',
        content: '**balasan telah dihapus**',
      },
    ];

    expect(replies).toEqual(expectedReply);
  });

  it('should create ReplyDetails object correctly', () => {
    const payload = {
      replies: [
        {
          id: 'reply-456',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah balasan',
        },
        {
          id: 'reply-123',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**balasan telah dihapus**',
        },
      ],
    };

    const { replies } = new ReplyDetails(payload);

    expect(replies).toEqual(payload.replies);
  });
});
