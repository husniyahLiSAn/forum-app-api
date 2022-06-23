const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {});

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
    });

    afterEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should persist add thread and return added thread correctly', async () => {
        // Arrange
        const payload = new AddThread({
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
        });
        const fakeIdGenerator = () => '123'; // stub!
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        await threadRepositoryPostgres.addThread(payload);

        // Assert
        const threads = await ThreadsTableTestHelper.verifyThreadById('thread-123');

        expect(threads).toHaveLength(1);
      });

      it('should return added thread correctly', async () => {
        // Arrange
        const payload = new AddThread({
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123'; // stub!
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedThread = await threadRepositoryPostgres.addThread(payload);

        // Assert
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-123',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          owner: 'user-123',
        }));
      });
    });

    describe('verifyThreadById function', () => {
      it('should throw NotFoundError when thread does not exist', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyThreadById('thread-123'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread exist', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyThreadById('thread-123'))
          .resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('getDetailThreadById function', () => {
      it('should not throw error when thread exist', async () => {
        // Arrange
        const now = new Date();
        await ThreadsTableTestHelper.addThread({
          id: 'thread-724',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
          date: now,
        });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const thread = await threadRepositoryPostgres.getDetailThreadById('thread-724');

        // Assert
        expect(thread).toStrictEqual(new DetailThread({
          id: 'thread-724',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          date: now.toISOString(),
          username: 'dicoding',
          comments: [],
        }));
      });
    });
  });
});
