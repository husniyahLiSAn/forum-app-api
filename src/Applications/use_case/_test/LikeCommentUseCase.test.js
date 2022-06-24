const LikeCommentUseCase = require('../LikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('LikeCommentUseCase', () => {
  it('should orchestrating add like for a comment correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockCommentRepository.verifyCommentOnThread = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkCommentAlreadyLiked = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          comment_id: 'comment-123',
          owner: 'user-123',
        },
      ]));
    mockLikeRepository.removeLike = jest.fn();

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute(payload);

    expect(mockLikeRepository.checkCommentAlreadyLiked).toBeCalledWith(
      payload.commentId,
      payload.userId,
    );
    expect(mockLikeRepository.addLike).toBeCalledWith(
      payload.commentId,
      payload.userId,
    );
    expect(mockLikeRepository.removeLike)
      .not.toHaveBeenCalled();
  });

  it('should orchestrating remove like from a comment correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };
    const expectedGetLike = [{
      id: 'like-123',
      thread_id: 'thread-123',
      comment_id: 'comment-123',
      owner: 'user-123',
    }];

    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockCommentRepository.verifyCommentOnThread = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkCommentAlreadyLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedGetLike));
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn();

    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeCommentUseCase.execute(payload);

    expect(mockLikeRepository.checkCommentAlreadyLiked).toBeCalledWith(
      payload.commentId,
      payload.userId,
    );
    expect(mockLikeRepository.removeLike).toBeCalledWith(
      payload.commentId,
      payload.userId,
    );
    expect(mockLikeRepository.addLike)
      .not.toHaveBeenCalled();
  });
});
