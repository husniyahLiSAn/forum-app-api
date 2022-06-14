const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const idThread = 'thread-123';
    const expectedThread = new DetailThread({
      id: idThread,
      title: 'Lorem Ipsum',
      body: 'A thread description',
      date: '2022-06-03T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    });

    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'I got a thread description',
        date: '2022-06-03T08:03:49.359Z',
        username: 'johndoe',
        comment_id: 'comment-123',
        isDelete: false,
      },
      {
        id: 'reply-124',
        content: 'Allright',
        date: '2022-06-04T08:29:36.362Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        isDelete: true,
      },
      {
        id: 'reply-125',
        content: 'Allright, I got a thread description',
        date: '2022-06-04T10:56:21.341Z',
        username: 'dicoding',
        comment_id: 'comment-124',
        isDelete: false,
      },
    ];

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2022-06-03T07:21:25.125Z',
        replies: [],
        content: 'Just a comment',
        isDelete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: '2022-06-03T08:26:45.595Z',
        replies: [],
        content: 'Leaving a comment',
        isDelete: true,
      },
    ];

    const expectedOutput = new DetailThread({
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
          isDelete: false,
          replies: [
            {
              id: 'reply-123',
              content: 'I got a thread description',
              date: '2022-06-03T08:03:49.359Z',
              username: 'johndoe',
              comment_id: 'comment-123',
              isDelete: false,
            },
            {
              id: 'reply-124',
              content: 'Allright',
              date: '2022-06-04T08:29:36.362Z',
              username: 'dicoding',
              comment_id: 'comment-123',
              isDelete: true,
            },
          ],
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2022-06-03T08:26:45.595Z',
          content: 'Leaving a comment',
          isDelete: true,
          replies: [
            {
              id: 'reply-125',
              content: 'Allright, I got a thread description',
              date: '2022-06-04T10:56:21.341Z',
              username: 'dicoding',
              comment_id: 'comment-124',
              isDelete: false,
            },
          ],
        },
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockThreadRepository.getRepliesByThreadCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(idThread);

    // Asset
    expect(detailThread).toEqual(expectedOutput);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(idThread);
    expect(mockThreadRepository.getCommentsByThreadId).toBeCalledWith(idThread);
    expect(mockThreadRepository.getRepliesByThreadCommentId)
      .toBeCalledWith(idThread, expectedComments.map((comment) => comment.id));
  });
});
