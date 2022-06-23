const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      user: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAccess = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(payload);

    // Assert
    expect(mockCommentRepository.verifyCommentById).toBeCalledWith(payload.commentId);
    expect(mockCommentRepository.verifyAccess).toBeCalledWith(
      payload.commentId,
      payload.user,
    );
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(payload.commentId);
  });
});
