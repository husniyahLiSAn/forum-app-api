const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
      user: 'user-123',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.verifyReplyById = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyAccess = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(payload);

    // Assert
    expect(mockReplyRepository.verifyReplyById).toBeCalledWith(
      payload.replyId,
    );
    expect(mockReplyRepository.verifyAccess).toBeCalledWith(
      payload.replyId,
      payload.user,
    );
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(
      payload.replyId,
    );
  });
});
