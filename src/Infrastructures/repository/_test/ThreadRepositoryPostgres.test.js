const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
        const threads = await ThreadsTableTestHelper.getThreadById('thread-123');

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

    describe('getThreadById function', () => {
      it('should return NotFoundError when thread not found', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
          date: '2022-06-02T04:54:33.160Z',
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action and Assert
        await expect((threadRepositoryPostgres.getThreadById('thread-345'))).rejects.toThrowError(NotFoundError);
      });

      it('should not throw error when thread found', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          owner: 'user-123',
          date: '2022-06-02T04:54:33.160Z',
        });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const thread = await threadRepositoryPostgres.getThreadById('thread-123');

        // Assert
        expect(thread).toStrictEqual({
          id: 'thread-123',
          title: 'Lorem ipsum dolor sit amet, consectetur',
          body: 'The thread added sit amet',
          date: '2022-06-02T04:54:33.160Z',
          username: 'dicoding',
        });
      });
    });
  });
});
