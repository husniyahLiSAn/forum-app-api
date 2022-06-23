const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

// Helper function
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request did not have accessToken', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        threadId: 'thread-123',
        date: new Date().toISOString(),
        content: 'Generate stone trademark',
        owner: 'user-123',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-234/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread does not exist', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-347',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-259',
        content: 'Generate stone trademark',
        date: new Date().toISOString(),
        owner: 'user-123',
        threadId: 'thread-347',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/xxx/comments/comment-259/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar pada Thread tidak ditemukan');
    });

    it('should response 404 when the comment does not exist', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        owner: 'user-123',
        date: new Date().toISOString(),
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/xxx/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar pada Thread tidak ditemukan');
    });

    it('should response 200 and persisted like or unlike a comment', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: new Date().toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-564',
        content: 'Generate stone trademark',
        date: new Date().toISOString(),
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-564/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
