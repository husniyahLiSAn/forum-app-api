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
    const expectedDeletedComment = {
      status: 'success',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDeletedComment));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const deletedComment = await deleteCommentUseCase.execute(payload);

    // Assert
    expect(deletedComment).toStrictEqual(expectedDeletedComment);
    expect(mockCommentRepository.verifyAccess).toBeCalledWith(
      payload.commentId,
      payload.user,
    );
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(
      payload.commentId,
    );
  });
});
