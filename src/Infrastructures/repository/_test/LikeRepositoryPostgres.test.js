const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
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
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    pool.end();
  });

  describe('checkCommentAlreadyLiked', () => {
    it('should returning false if user never liked a comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const result = await likeRepositoryPostgres.checkCommentAlreadyLiked('comment-123', 'user-123');
      expect(result).toHaveLength(0);
    });

    it('should returning true if user already liked a comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      // Action & Assert
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const result = await likeRepositoryPostgres.checkCommentAlreadyLiked('comment-123', 'user-123');
      expect(result).toHaveLength(1);
    });
  });

  describe('addLike', () => {
    it('should persist add like to comment and return added comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => 123;

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const result = await likeRepositoryPostgres.checkCommentAlreadyLiked('comment-123', 'user-123');
      expect(result).toHaveLength(1);
      expect(result[0].comment_id).toEqual('comment-123');
      expect(result[0].owner).toEqual('user-123');
    });
  });

  describe('removeLike', () => {
    it('should remove like from a comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      // Action
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await likeRepositoryPostgres.removeLike('comment-123', 'user-123');

      // Assert
      const result = await LikesTableTestHelper.verifyLikeInComment('like-123');
      expect(result).toHaveLength(0);
    });
  });

  describe('countLikes', () => {
    it('should return the number of total likes from comments', async () => {
      // Arrange
      // Users
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'user_test_pertama',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-379',
        username: 'user_test_kedua',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'user_test_ketiga',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-789',
        username: 'user_test_empat',
      });

      // Comments
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      // Likes
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-124',
        commentId: 'comment-123',
        userId: 'user-321',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-125',
        commentId: 'comment-123',
        userId: 'user-789',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-134',
        commentId: 'comment-124',
        userId: 'user-456',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-135',
        commentId: 'comment-124',
        userId: 'user-123',
      });
      await LikesTableTestHelper.addLike({
        id: 'like-160',
        commentId: 'comment-123',
        userId: 'user-379',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const likeCounts = await likeRepositoryPostgres.countLikes(['comment-123', 'comment-124', 'comment-456']);
      expect(likeCounts).toHaveLength(2);
      expect(likeCounts.filter((likeCount) => likeCount.comment_id === 'comment-123')[0].count).toEqual('4');
      expect(likeCounts.filter((likeCount) => likeCount.comment_id === 'comment-124')[0].count).toEqual('2');
    });

    it('should return zero like from a comment if no one like the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const likeCount = await likeRepositoryPostgres.countLikes(['comment-123']);
      expect(likeCount).toHaveLength(0);
    });
  });
});
