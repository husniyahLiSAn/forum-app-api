const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
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
        title: 'test 1',
        body: 'test 2',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
    });

    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment', () => {
      it('should persist add comment and return added comment correctly', async () => {
        // Arrange
        const data = new AddComment({
          content: 'What is dis',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        const fakeIdGenerator = () => '123'; // stub!
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(data);

        // Assert
        const comment = await CommentsTableTestHelper.verifyCommentById('comment-123');
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'What is dis',
          owner: 'user-123',
          threadId: 'thread-123',
        }));
        expect(comment).toHaveLength(1);
        expect(comment[0].is_delete).toEqual(false);
      });

      it('should return added comment correctly', async () => {
        // Arrange
        const addComment = new AddComment({
          content: 'Generate stone trademark comment',
          owner: 'user-123',
          threadId: 'thread-123',
        });
        const fakeIdGenerator = () => '123'; // stub!
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(addComment);

        // Assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'Generate stone trademark comment',
          owner: 'user-123',
          threadId: 'thread-123',
        }));
      });
    });

    describe('verifyCommentById', () => {
      it('should throw NotFoundError when thread does not exist', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentById('comment-123'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread exist', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-113',
          content: 'Lorem ipsum',
          owner: 'user-123',
          threadId: 'thread-123',
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentById('comment-113'))
          .resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('verifyAccess', () => {
      it('should throw AuthorizationError when credential user does not match with owner', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'Say Yeah',
          owner: 'user-123',
          threadId: 'thread-123',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAccess('comment-123', 'user-567'))
          .rejects
          .toThrowError(AuthorizationError);
      });

      it('should not throw AuthorizationError or NotFoundError when credential user does not match with owner', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'Hi!',
          owner: 'user-123',
          threadId: 'thread-123',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyAccess('comment-123', 'user-123'))
          .resolves.not.toThrow(NotFoundError);
        await expect(commentRepositoryPostgres.verifyAccess('comment-123', 'user-123'))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('verifyCommentOnThread function', () => {
      it('should return NotFoundError when thread or comment does not exist', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOnThread('thread-xxx', 'comment-xxx'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should throw NotFoundError when comment does not exist', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOnThread('thread-123', 'comment-123'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should not throw error when comment found on a thread', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          owner: 'user-123',
          threadId: 'thread-123',
        });

        // Action & Assert
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await expect(commentRepositoryPostgres.verifyCommentOnThread('thread-123', 'comment-123'))
          .resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should return no comments in a thread', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const result = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(result).toHaveLength(0);
      });

      it('should return all of the comments in a thread', async () => {
        // Arrange
        const now = new Date();
        await CommentsTableTestHelper.addComment({
          id: 'comment-113',
          content: 'Lorem ipsum',
          date: '2022-06-06',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        await CommentsTableTestHelper.addComment({
          id: 'comment-321',
          content: 'Lorem ipsum',
          date: '2022-06-12',
          owner: 'user-123',
          threadId: 'thread-123',
          isDelete: true,
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(comments).toHaveLength(2);
        expect(comments[0]).toStrictEqual(new DetailComment({
          id: 'comment-113',
          username: 'johnD0e',
          content: 'Lorem ipsum',
          date: new Date(comments[0].date).toISOString(),
          likeCount: 0,
          isDeleted: false,
          replies: [],
        }));
        expect(comments[1]).toStrictEqual(new DetailComment({
          id: 'comment-321',
          username: 'johnD0e',
          content: '**komentar telah dihapus**',
          date: new Date(comments[1].date).toISOString(),
          likeCount: 0,
          isDeleted: true,
          replies: [],
        }));
      });
    });

    describe('deleteCommentById', () => {
      it('should return soft delete comment correctly', async () => {
        // Arrange
        await CommentsTableTestHelper.addComment({
          id: 'comment-ds323',
          content: 'Keep this one',
          owner: 'user-123',
          threadId: 'thread-123',
        });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        await commentRepositoryPostgres.verifyCommentById('comment-ds323');
        await commentRepositoryPostgres.deleteCommentById('comment-ds323');

        // Assert
        const comment = await CommentsTableTestHelper.verifyCommentById('comment-ds323');
        expect(comment[0].id).toEqual('comment-ds323');
        expect(comment[0].is_delete).toEqual(true);
      });
    });
  });
});
