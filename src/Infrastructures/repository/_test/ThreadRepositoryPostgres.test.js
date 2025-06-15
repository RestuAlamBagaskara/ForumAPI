const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createNewThread function', () => {
    it('should persist new thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      const newThread = new NewThread({
        title: 'Redemption Arc',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      const fakeIdGenerator = () => '111'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.createNewThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-111',
      );
      expect(threads).toHaveLength(1);
    });

    it('should return AddedThread object correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      const newThread = new NewThread({
        title: 'Redemption Arc',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });
      const fakeIdGenerator = () => '111'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.createNewThread(
        newThread,
      );

      // Assert
      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual('thread-111');
      expect(addedThread.title).toEqual('Redemption Arc');
      expect(addedThread.owner).toEqual('user-111');
    });
  });

  describe('threadIsExist function', () => {
    it('should throw NotFoundError if thread not found in database', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadId = 'thread-404';

      await expect(
        threadRepositoryPostgres.threadIsExist(threadId),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread found in database', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'alam',
      });

      await ThreadsTableTestHelper.createNewThread({
        id: 'thread-111',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      });

      await expect(
        threadRepositoryPostgres.threadIsExist('thread-111'),
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadDetailsById function', () => {
    it('should get thread details', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const userPayload = {
        id: 'user-111',
        username: 'alam',
      };

      await UsersTableTestHelper.addUser(userPayload);

      const threadPayload = {
        id: 'thread-111',
        title: 'Redemption Arc',
        body: 'lorem ipsum dolor sit amet',
        owner: 'user-111',
      };

      await ThreadsTableTestHelper.createNewThread(threadPayload);

      const detailThread = await threadRepositoryPostgres.getThreadDetailsById(
        threadPayload.id,
      );

      expect(detailThread.id).toEqual(threadPayload.id);
      expect(detailThread.title).toEqual(threadPayload.title);
      expect(detailThread.body).toEqual(threadPayload.body);
      expect(detailThread.username).toEqual(userPayload.username);
    });
  });
});
