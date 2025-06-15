const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentOnThread function', () => {
    it('should persist new comment', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'Redemption Arc',
        owner: 'user-111',
      });

      const newComment = new AddComment({
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      const fakeIdGenerator = () => '111';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.addCommentOnThread(newComment);

      const comment = await CommentsTableTestHelper.findCommentById(
        'comment-111',
      );
      expect(comment).toHaveLength(1);
    });

    it('should return AddedComment object correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'Redemption Arc',
        owner: 'user-111',
      });

      const newComment = new AddComment({
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      const fakeIdGenerator = () => '111';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addCommentOnThread(
        newComment,
      );

      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toEqual('comment-111');
      expect(addedComment.content).toEqual('lorem ipsum dolor sit amet');
      expect(addedComment.owner).toEqual('user-111');
    });
  });

  describe('commentIsExist function', () => {
    it('should throw NotFoundError if comment not found in database', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-404';

      await expect(
        commentRepositoryPostgres.commentIsExist(commentId),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment found in database', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await CommentsTableTestHelper.addCommentOnThread({
        id: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      await expect(
        commentRepositoryPostgres.commentIsExist('comment-111'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyOwnership function', () => {
    it('should throw AuthorizationError if comment not belong to comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await UsersTableTestHelper.addUser({
        id: 'user-222',
        username: 'mala',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await CommentsTableTestHelper.addCommentOnThread({
        id: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      const owner = 'user-222';

      await expect(
        commentRepositoryPostgres.verifyOwnership('comment-111', owner),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment is belongs to comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await CommentsTableTestHelper.addCommentOnThread({
        id: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      await expect(
        commentRepositoryPostgres.verifyOwnership('comment-111', 'user-111'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('softDeleteComment function', () => {
    it('should soft delete comment from database', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await CommentsTableTestHelper.addCommentOnThread({
        id: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        threadId: 'thread-111',
        owner: 'user-111',
      });

      await commentRepositoryPostgres.softDeleteComment('comment-111');

      const comment = await CommentsTableTestHelper.isDeleted('comment-111');
      const isoDateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

      expect(typeof comment).toEqual('string');
      expect(isoDateRegex.test(comment)).toBeTruthy();
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should get thread comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const userPayload = {
        id: 'user-111',
        username: 'alam',
      };

      const threadPayload = {
        id: 'thread-111',
        title: 'Redemption Arc',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      };

      const commentPayload = {
        id: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        threadId: threadPayload.id,
        owner: userPayload.id,
      };

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.createNewThread(threadPayload);
      await CommentsTableTestHelper.addCommentOnThread(commentPayload);

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadPayload.id,
      );

      expect(Array.isArray(comments)).toBe(true);
      expect(comments[0].id).toEqual(commentPayload.id);
      expect(comments[0].thread_id).toEqual(threadPayload.id);
      expect(comments[0].username).toEqual(userPayload.username);
      expect(comments[0].content).toEqual('lorem ipsum dolor sit amet');
      expect(comments[0].deleted_at).toBeDefined();
      expect(comments[0].date).toBeDefined();
    });
  });
});
