const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const idThread = 'thread-123';
    const expectedThread = {
      id: idThread,
      title: 'Lorem Ipsum',
      body: 'A thread description',
      date: '2022-06-03T07:19:09.775Z',
      username: 'dicoding',
    };

    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'I got a thread description',
        date: '2022-06-03T08:03:49.359Z',
        username: 'johndoe',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-124',
        content: 'Allright',
        date: '2022-06-04T08:29:36.362Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-125',
        content: 'Allright, I got a thread description',
        date: '2022-06-04T10:56:21.341Z',
        username: 'dicoding',
        comment_id: 'comment-124',
        is_delete: false,
      },
    ];

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2022-06-03T07:21:25.125Z',
        content: 'Just a comment',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: '2022-06-03T08:26:45.595Z',
        content: 'Leaving a comment',
        is_delete: false,
      },
      {
        id: 'comment-125',
        username: 'dicoding',
        date: '2022-06-03T09:26:45.595Z',
        content: 'Leaving a comment',
        is_delete: true,
      },
    ];

    const expectedOutput = {
      id: idThread,
      title: 'Lorem Ipsum',
      body: 'A thread description',
      date: '2022-06-03T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2022-06-03T07:21:25.125Z',
          content: 'Just a comment',
          replies: [
            {
              id: 'reply-123',
              content: 'I got a thread description',
              date: '2022-06-03T08:03:49.359Z',
              username: 'johndoe',
            },
            {
              id: 'reply-124',
              content: '**balasan telah dihapus**',
              date: '2022-06-04T08:29:36.362Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2022-06-03T08:26:45.595Z',
          content: 'Leaving a comment',
          replies: [
            {
              id: 'reply-125',
              content: 'Allright, I got a thread description',
              date: '2022-06-04T10:56:21.341Z',
              username: 'dicoding',
            },
          ],
        },
        {
          id: 'comment-125',
          username: 'dicoding',
          date: '2022-06-03T09:26:45.595Z',
          content: '**komentar telah dihapus**',
          replies: [],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByThreadCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(idThread);

    // Asset
    expect(detailThread).toEqual(expectedOutput);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(idThread);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(idThread);
    expect(mockReplyRepository.getRepliesByThreadCommentId)
      .toBeCalledWith(idThread, expectedComments.map((comment) => comment.id));
  });
});
