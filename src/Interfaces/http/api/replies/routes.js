const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{id}',
    handler: handler.softDeleteReplyHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
];

module.exports = routes;
