const CommentDetails = require('../CommentDetails');

describe('CommentDetails entities', () => {
  it('should create CommentDetails object correctly', () => {
    const payload = {
      comments: [
        {
          id: 'comment-111',
          username: 'alam',
          date: '2025-01-08T07:22:33.555Z',
          content: 'lorem ipsum',
          deleted_at: '',
        },
        {
          id: 'comment-222',
          username: 'bagas',
          date: '2025-01-09T07:26:21.338Z',
          content: 'deleted',
          deleted_at: '2025-01-09T07:26:21.338Z',
        },
      ],
    };

    const { comments } = new CommentDetails(payload);

    const expectedComment = [
      {
        id: 'comment-111',
        username: 'alam',
        date: '2025-01-08T07:22:33.555Z',
        content: 'lorem ipsum',
      },
      {
        id: 'comment-222',
        username: 'bagas',
        date: '2025-01-09T07:26:21.338Z',
        content: '**komentar telah dihapus**',
      },
    ];

    expect(comments).toEqual(expectedComment);
  });
});
