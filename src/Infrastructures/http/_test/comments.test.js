const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

// Helper function
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request did not have accessToken', async () => {
      // Arrange
      const now = new Date();
      const request = {
        content: 'Generate stone trademark',
      };

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Generate stone trademark',
        date: now.toISOString(),
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: request,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread does not exist', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const request = {
        content: 'Generate stone trademark',
        threadId: 'thread-862',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${request.threadId}/comments`,
        payload: request,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const now = new Date();
      const request = {};

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: request,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data specification', async () => {
      // Arrange
      const now = new Date();
      const request = {
        content: [],
        threadId: 'thread-123',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${request.threadId}/comments`,
        payload: request,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const now = new Date();
      const accessToken = await ServerTestHelper.getAccessToken();
      const request = {
        content: 'Generate stone trademark',
        threadId: 'thread-123',
      };

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${request.threadId}/comments`,
        payload: request,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(request.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when comment does not exist', async () => {
      // Arrange
      const now = new Date();
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when user delete another user\'s comment', async () => {
      // Arrange
      const now = new Date();
      const accessToken = await ServerTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'passwordygy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-456',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'Generate stone trademark',
        owner: 'user-456',
        threadId: 'thread-456',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-456/comments/comment-456',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Proses gagal! Anda tidak berhak mengakses komentar ini');
    });

    it('should response 401 when request did not have accesToken', async () => {
      // Arrange
      const now = new Date();
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
        date: now.toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Generate stone trademark',
        date: now.toISOString(),
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when delete comment correctly', async () => {
      // Arrange
      const now = new Date();
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: now.toISOString(),
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Generate stone trademark',
        date: now.toISOString(),
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
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
