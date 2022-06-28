const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const now = new Date();
    const idThread = 'thread-123';
    const expectedThread = new DetailThread({
      id: idThread,
      title: 'Lorem Ipsum',
      body: 'A thread description',
      date: now.toISOString(),
      username: 'dicoding',
      comments: [],
    });

    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'I got a thread description',
        date: now.toISOString(),
        username: 'johndoe',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-124',
        content: 'Allright',
        date: now.toISOString(),
        username: 'dicoding',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-125',
        content: 'Allright, I got a thread description',
        date: now.toISOString(),
        username: 'dicoding',
        comment_id: 'comment-124',
        is_delete: false,
      },
    ];

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: now.toISOString(),
        content: 'Just a comment',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: now.toISOString(),
        content: 'Leaving a comment',
        is_delete: false,
      },
      {
        id: 'comment-125',
        username: 'dicoding',
        date: now.toISOString(),
        content: 'Leaving a comment',
        is_delete: true,
      },
    ];

    const expectedOutput = new DetailThread({
      id: idThread,
      title: 'Lorem Ipsum',
      body: 'A thread description',
      date: now.toISOString(),
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'comment-123',
          username: 'johndoe',
          date: now.toISOString(),
          content: 'Just a comment',
          likeCount: 7,
          replies: [
            new DetailReply({
              id: 'reply-123',
              content: 'I got a thread description',
              date: now.toISOString(),
              username: 'johndoe',
            }),
            new DetailReply({
              id: 'reply-124',
              content: '**balasan telah dihapus**',
              date: now.toISOString(),
              username: 'dicoding',
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-124',
          username: 'dicoding',
          date: now.toISOString(),
          content: 'Leaving a comment',
          likeCount: 15,
          replies: [
            new DetailReply({
              id: 'reply-125',
              content: 'Allright, I got a thread description',
              date: now.toISOString(),
              username: 'dicoding',
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-125',
          username: 'dicoding',
          date: now.toISOString(),
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        }),
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockThreadRepository.getDetailThreadById = jest.fn(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesByThreadCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));
    mockLikeRepository.countLikes = jest.fn()
      .mockImplementation(() => Promise.resolve(
        [
          { comment_id: 'comment-123', count: '7' },
          { comment_id: 'comment-124', count: '15' },
          { comment_id: 'comment-125', count: '0' },
        ],
      ));

    /** creating use case instance */
    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(idThread);

    // Asset
    expect(detailThread).toEqual(expectedOutput);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(idThread);
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(idThread);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(idThread);
    expect(mockReplyRepository.getRepliesByThreadCommentId)
      .toBeCalledWith(idThread, expectedComments.map((comment) => comment.id));
    expect(mockLikeRepository.countLikes)
      .toBeCalledWith(expectedComments.map((comment) => comment.id));
  });
});
