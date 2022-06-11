const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

// Helper function
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/replies endpoint', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request did not have accessToken', async () => {
      // Arrange
      const requestPayload = {
        content: 'Generate stone trademark',
      };
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
        date: '2022-06-04T02:04:43.260Z',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        threadId: 'thread-123',
        date: '2022-06-04T03:48:30.111Z',
        content: 'Generate stone trademark',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        commentId: 'comment-234',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-234/replies',
        payload: requestPayload,
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
      };
      await ThreadsTableTestHelper.addThread({
        id: 'thread-347',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: '2022-06-04T02:04:43.260Z',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-259',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        threadId: 'thread-347',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/comment-259/replies',
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

    it('should response 404 when the comment does not exist', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        content: 'Generate stone trademark',
      };
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        owner: 'user-123',
        date: '2022-06-04T02:04:43.260Z',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-790/replies',
        payload: requestPayload,
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

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {};

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: '2022-06-04T02:04:43.260Z',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        threadId: 'thread-123',
        date: '2022-06-04T03:48:30.111Z',
        content: 'Generate stone trademark',
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-234/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data specification', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        content: [{}],
      };

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        owner: 'user-123',
        date: '2022-06-04T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        threadId: 'thread-123',
        date: '2022-06-04T03:48:30.111Z',
        content: 'Generate stone trademark',
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-234/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        content: 'Bubu content gaga',
      };

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: '2022-06-04T02:04:43.260Z',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-564',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-564/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 404 when the reply does not exist', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        owner: 'user-123',
        date: '2022-06-04T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3414',
        threadId: 'thread-123',
        date: '2022-06-04T03:48:30.111Z',
        content: 'Generate stone trademark',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        commentId: 'comment-3414',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-3414/replies/reply-1232',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 403 when user delete another user\'s reply', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({
        id: 'user-2134',
        username: 'johndoe',
        password: 'passwordygy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        date: '2022-06-04T02:04:43.260Z',
        owner: 'user-2134',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-234',
        content: 'Guys',
        owner: 'user-2134',
        threadId: 'thread-456',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-312',
        content: 'Generate stone trademark',
        owner: 'user-2134',
        commentId: 'comment-234',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-456/comments/comment-234/replies/reply-312',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Proses gagal! Anda tidak berhak mengakses balasan ini');
    });

    it('should response 401 when request did not have accesToken', async () => {
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
        owner: 'user-123',
        date: '2022-06-04T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when delete reply correctly', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-31232',
        title: 'Proposal convention',
        body: 'Lorem ipsum dolor',
        owner: 'user-123',
        date: '2022-06-04T02:04:43.260Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-121',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        threadId: 'thread-31232',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-121',
        content: 'Generate stone trademark',
        date: '2022-06-04T03:48:30.111Z',
        owner: 'user-123',
        commentId: 'comment-121',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-31232/comments/comment-121/replies/reply-121',
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
