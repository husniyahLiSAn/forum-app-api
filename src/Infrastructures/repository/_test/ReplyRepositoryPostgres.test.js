const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ReplyRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('behavior test', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'johnD0e',
        password: 'secret_password',
        fullname: 'John Doe',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Lorem ipsum dolor sit amet, consectetur adip',
        body: 'test describe dis sit amet',
        date: '2022-06-04T02:26:43.260Z',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Dolor should dis sit amet',
        date: '2022-06-04T03:26:43.260Z',
        owner: 'user-123',
        threadId: 'thread-123',
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

    describe('addReply', () => {
      it('should persist add reply and return added reply correctly', async () => {
        // Arrange
        const data = new AddReply({
          content: 'Say Cool',
          owner: 'user-123',
          threadId: 'thread-123',
          commentId: 'comment-123',
        });
        const fakeIdGenerator = () => '123'; // stub!
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedReply = await replyRepositoryPostgres.addReply(data);

        // Assert
        const reply = await RepliesTableTestHelper.getReplyById('reply-123');
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: 'Say Cool',
          owner: 'user-123',
          commentId: 'comment-123',
        }));
        expect(reply).toHaveLength(1);
        expect(reply[0].is_delete).toEqual(false);
      });

      it('should return added reply correctly', async () => {
        // Arrange
        const addReply = new AddReply({
          content: 'Generate stone trademark reply',
          owner: 'user-123',
          threadId: 'thread-123',
          commentId: 'comment-123',
        });
        const fakeIdGenerator = () => '123'; // stub!
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedReply = await replyRepositoryPostgres.addReply(addReply);

        // Assert
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: 'Generate stone trademark reply',
          owner: 'user-123',
          commentId: 'comment-123',
        }));
      });
    });

    describe('verifyAccess', () => {
      it('should throw NotFoundError when reply not found', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAccess('reply-345', 'users-123'))
          .rejects
          .toThrowError(NotFoundError);
      });

      it('should throw AuthorizationError when credential user does not match with owner', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Say Yeah',
          owner: 'user-123',
          commentId: 'comment-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAccess('reply-123', 'user-567'))
          .rejects
          .toThrowError(AuthorizationError);
      });

      it('should not throw AuthorizationError or NotFoundError when credential user does not match with owner', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Hi!',
          owner: 'user-123',
          commentId: 'comment-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyAccess('reply-123', 'user-123'))
          .resolves.not.toThrow(NotFoundError);
        await expect(replyRepositoryPostgres.verifyAccess('reply-123', 'user-123'))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('getReplyById function', () => {
      it('should return NotFoundError when reply not found', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Keep this',
          owner: 'user-123',
          commentId: 'comment-123',
        });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action and Assert
        await expect((replyRepositoryPostgres.getReplyById('reply-345'))).rejects.toThrowError(NotFoundError);
      });

      it('should not throw error when reply found', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Keep this one',
          owner: 'user-123',
          commentId: 'comment-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const reply = await replyRepositoryPostgres.getReplyById('reply-123');

        // Assert
        expect(reply).toStrictEqual({
          id: 'reply-123',
          content: 'Keep this one',
          date: '2022-06-03T08:54:33.160Z',
          username: 'johnD0e',
        });
      });
    });

    describe('getRepliesByThreadId function', () => {
      it('should return no replies in a thread', async () => {
        // Arrange
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

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const result = await replyRepositoryPostgres.getRepliesByThreadCommentId('thread-123', ['comment-321']);

        // Assert
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should return all of the replies in a thread', async () => {
        // Arrange
        const idThread = 'thread-123';
        await UsersTableTestHelper.addUser({ id: 'user-234', username: 'UserA' });
        await UsersTableTestHelper.addUser({ id: 'user-456', username: 'UserB' });

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

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const result = await replyRepositoryPostgres.getRepliesByThreadCommentId('thread-123', ['comment-122', 'comment-124']);

        // Assert
        expect(result).toHaveLength(2);
      });
    });

    describe('deleteReplyById', () => {
      it('should throw NotFoundError when reply not found', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
          .rejects
          .toThrowError(NotFoundError);
      });

      it('should return soft delete reply correctly', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-ds323',
          content: 'Keep this one',
          commentId: 'comment-123',
          owner: 'user-123',
        });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const result = await replyRepositoryPostgres.deleteReplyById('reply-ds323');

        // Assert
        const reply = await RepliesTableTestHelper.getReplyById('reply-ds323');
        expect(result.status).toEqual('success');
        expect(reply[0].id).toEqual('reply-ds323');
        expect(reply[0].is_delete).toEqual(true);
      });
    });
  });
});
