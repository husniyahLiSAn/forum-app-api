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

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        date: '2022-06-03T07:21:25.125Z',
        content: 'Just a comment',
        username: 'johndoe',
        replies: [],
      }),
      new DetailComment({
        id: 'comment-124',
        date: '2022-06-03T08:26:45.595Z',
        content: 'Ipsum a comment',
        username: 'dicoding',
        replies: [],
      }),
    ];

    const expectedReplies = [
      new DetailReply({
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        date: '2022-06-03T08:03:49.359Z',
        username: 'johndoe',
        commentId: 'comment-123',
      }),
      new DetailReply({
        id: 'reply-124',
        content: 'Allright',
        date: '2022-06-04T08:29:36.362Z',
        username: 'dicoding',
        commentId: 'comment-123',
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(idThread);

    // Asset
    expect(detailThread).toEqual(new DetailThread({
      ...expectedThread, comments: expectedComments,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(idThread);
    expect(mockThreadRepository.getCommentsByThreadId).toBeCalledWith(idThread);
    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(idThread);
  });
});
