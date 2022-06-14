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

    describe('getCommentsByThreadId', () => {
      it('should return no comments in a thread', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Take your cake',
          body: 'node js',
          owner: 'user-123',
        });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const result = await threadRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should return all of the comments in a thread', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Take your cake',
          body: 'node js',
          owner: 'user-123',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-113',
          content: 'Lorem ipsum',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-321',
          content: 'Lorem ipsum',
          owner: 'user-123',
          threadId: 'thread-123',
          isDelete: true,
        });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const comments = await threadRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(comments).toHaveLength(2);
      });
    });

    describe('getRepliesByThreadId function', () => {
      it('should return no replies in a thread', async () => {
        // Arrange
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          title: 'Take your cake',
          body: 'node js',
          owner: 'user-123',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-046',
          content: 'Lorem ipsum',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-321',
          content: 'Lorem ipsum',
          owner: 'user-123',
          threadId: 'thread-123',
          isDelete: true,
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const result = await threadRepositoryPostgres.getRepliesByThreadCommentId('thread-123', ['comment-321']);

        // Assert
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should return all of the replies in a thread', async () => {
        // Arrange
        const idThread = 'thread-123';
        await UsersTableTestHelper.addUser({ id: 'user-234', username: 'UserA' });
        await UsersTableTestHelper.addUser({ id: 'user-456', username: 'UserB' });

        await ThreadsTableTestHelper.addThread({
          id: idThread,
          title: 'Take your cake',
          body: 'node js',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-122',
          content: 'Lorem ipsum dolor sit amet',
          date: '2022-06-03T15:54:33.160Z',
          owner: 'user-123',
          threadId: idThread,
          isDelete: false,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-124',
          content: 'Picasso et al',
          date: '2022-06-03T18:04:33.160Z',
          owner: 'user-456',
          threadId: idThread,
          isDelete: true,
        });
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Miraculously',
          date: '2022-06-03T16:54:33.160Z',
          owner: 'user-123',
          commentId: 'comment-122',
          isDelete: true,
        });
        await RepliesTableTestHelper.addReply({
          id: 'reply-124',
          content: 'See this! Lorem ipsum dolor sit amet',
          date: '2022-06-03T21:04:33.160Z',
          owner: 'user-456',
          commentId: 'comment-122',
          isDelete: false,
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action
        const result = await threadRepositoryPostgres.getRepliesByThreadCommentId('thread-123', ['comment-122', 'comment-124']);

        // Assert
        expect(result).toHaveLength(2);
      });
    });
  });
});
