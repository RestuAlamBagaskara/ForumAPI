const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReplyOnThreadComment function', () => {
    it('should persist new reply', async () => {
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const newReply = new AddReply({
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const fakeIdGenerator = () => '111';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await replyRepositoryPostgres.addReplyOnThreadComment(newReply);

      const reply = await RepliesTableTestHelper.findRepliesById('reply-111');
      expect(reply).toHaveLength(1);
    });

    it('should return AddedReply object correctly', async () => {
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const newReply = new AddReply({
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const fakeIdGenerator = () => '111';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedReply = await replyRepositoryPostgres.addReplyOnThreadComment(
        newReply,
      );

      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply.id).toEqual('reply-111');
      expect(addedReply.content).toEqual('lorem ipsum dolor sit amet');
      expect(addedReply.owner).toEqual('user-111');
    });
  });

  describe('replyIsExist function', () => {
    it('should throw NotFoundError if reply not found in database', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const reply = 'reply-404';

      await expect(replyRepositoryPostgres.replyIsExist(reply)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should not throw NotFoundError if reply found in database', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await RepliesTableTestHelper.addReplyOnThreadComment({
        id: 'reply-111',
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await expect(
        replyRepositoryPostgres.replyIsExist('reply-111'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyOwnership function', () => {
    it('should throw AuthorizationError if reply not belong to reply owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await RepliesTableTestHelper.addReplyOnThreadComment({
        id: 'reply-111',
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const owner = 'user-222';

      await expect(
        replyRepositoryPostgres.verifyOwnership('reply-111', owner),
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if reply is belongs to reply owner', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await RepliesTableTestHelper.addReplyOnThreadComment({
        id: 'reply-111',
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await expect(
        replyRepositoryPostgres.verifyOwnership('reply-111', 'user-111'),
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('softDeleteReply function', () => {
    it('should soft delete reply from database', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
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
        threadId: 'thread-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await RepliesTableTestHelper.addReplyOnThreadComment({
        id: 'reply-111',
        threadId: 'thread-111',
        commentId: 'comment-111',
        content: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await replyRepositoryPostgres.softDeleteReply('reply-111');

      const reply = await RepliesTableTestHelper.isDeleted('reply-111');
      const isoDateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

      expect(typeof reply).toEqual('string');
      expect(isoDateRegex.test(reply)).toBeTruthy();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should get replies from a certain thread comment', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
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

      const replyPayload = {
        id: 'reply-111',
        threadId: threadPayload.id,
        commentId: commentPayload.id,
        content: 'lorem ipsum dolor sit amet',
        owner: userPayload.id,
      };

      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.createNewThread(threadPayload);
      await CommentsTableTestHelper.addCommentOnThread(commentPayload);
      await RepliesTableTestHelper.addReplyOnThreadComment(replyPayload);

      const replies = await replyRepositoryPostgres.getRepliesByThreadId(
        threadPayload.id,
      );

      expect(Array.isArray(replies)).toBe(true);
      expect(replies[0].id).toEqual(replyPayload.id);
      expect(replies[0].comment_id).toEqual(commentPayload.id);
      expect(replies[0].username).toEqual(userPayload.username);
      expect(replies[0].content).toEqual('lorem ipsum dolor sit amet');
      expect(replies[0].deleted_at).toBeDefined();
      expect(replies[0].date).toBeDefined();
    });
  });
});
