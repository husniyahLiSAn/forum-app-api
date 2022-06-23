const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

// Helper function
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 when request did not have accesToken', async () => {
      // Arrange
      const requestPayload = {
        title: 'Lorem ipsum',
        body: 'The thread added sit amet',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload did not meet data specification', async () => {
      // Arrange
      const requestPayload = {
        title: {},
        body: 678923,
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Lorem ipsum dolor sit amet',
        body: 'Added sit amet',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread does not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 200 and get thread with empty comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-422',
        title: 'Lorem ipsum dolor sit amet, consectetur',
        body: 'The thread added sit amet',
        owner: 'user-123',
      });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-422',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toStrictEqual([]);
    });

    it('should response 200 and get commented thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'passwordygy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Lorem ipsum dolor sit amet, consectetur',
        body: 'The thread added sit amet',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Lorem ipsum dolor sit amet',
        owner: 'user-123',
        threadId: 'thread-123',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'Could say something',
        owner: 'user-456',
        threadId: 'thread-123',
        isDelete: true,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0]).toBeDefined();
      expect(responseJson.data.thread.comments[1]).toBeDefined();
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 200 and get replies & comments from thread correctly', async () => {
      // Arrange
      const idThread = 'thread-789';
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
        password: 'passwordygy',
        fullname: 'John Doe',
      });
      await ThreadsTableTestHelper.addThread({
        id: idThread,
        title: 'Lorem ipsum dolor sit amet, consectetur',
        body: 'The thread added sit amet',
        owner: 'user-123',
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
        isDelete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        content: 'See this! Lorem ipsum dolor sit amet',
        owner: 'user-456',
        commentId: 'comment-122',
        isDelete: false,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${idThread}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0]).toBeDefined();
      expect(responseJson.data.thread.comments[1]).toBeDefined();
      expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0]).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
      expect(responseJson.data.thread.comments[0].replies[1]).toBeDefined();
      expect(responseJson.data.thread.comments[1].replies).toStrictEqual([]);
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(0);
    });
  });
});
