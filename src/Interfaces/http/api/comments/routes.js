const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{id}',
    handler: handler.softDeleteCommentHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
];

module.exports = routes;
