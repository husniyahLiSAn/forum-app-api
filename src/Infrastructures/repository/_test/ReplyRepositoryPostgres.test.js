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
        date: new Date().toISOString(),
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Dolor should dis sit amet',
        date: new Date().toISOString(),
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
        const reply = await RepliesTableTestHelper.verifyReplyById('reply-123');
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

    describe('verifyReplyById', () => {
      it('should throw NotFoundError when reply does not exist', async () => {
        // Arrange
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyReplyById('reply-6328'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when reply exist', async () => {
        // Arrange
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Say Yeah trademark',
          owner: 'user-123',
          commentId: 'comment-123',
        });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(replyRepositoryPostgres.verifyReplyById('reply-123'))
          .resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('verifyAccess', () => {
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
      });

      it('should return all of the replies in a thread', async () => {
        // Arrange
        const idThread = 'thread-123';
        await UsersTableTestHelper.addUser({
          id: 'user-456',
          username: 'johnDeok',
          password: 'secret_password!',
          fullname: 'John Duck',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-122',
          content: 'Lorem ipsum dolor sit amet',
          owner: 'user-123',
          threadId: idThread,
          isDelete: false,
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-124',
          content: 'Picasso et al',
          owner: 'user-456',
          threadId: idThread,
          isDelete: true,
        });
        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          content: 'Miraculously',
          owner: 'user-123',
          commentId: 'comment-122',
          date: new Date().toISOString(),
          isDelete: true,
        });
        await RepliesTableTestHelper.addReply({
          id: 'reply-124',
          content: 'See this! Lorem ipsum dolor sit amet',
          owner: 'user-456',
          commentId: 'comment-122',
          date: new Date().toISOString(),
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
        await replyRepositoryPostgres.verifyReplyById('reply-ds323');
        await replyRepositoryPostgres.deleteReplyById('reply-ds323');

        // Assert
        const reply = await RepliesTableTestHelper.verifyReplyById('reply-ds323');
        expect(reply[0].id).toEqual('reply-ds323');
        expect(reply[0].is_delete).toEqual(true);
      });
    });
  });
});
