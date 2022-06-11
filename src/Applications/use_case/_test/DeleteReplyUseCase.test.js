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
    const expectedDeletedReply = {
      status: 'success',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.verifyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDeletedReply));

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const deletedReply = await deleteReplyUseCase.execute(payload);

    // Assert
    expect(deletedReply).toStrictEqual(expectedDeletedReply);
    expect(mockReplyRepository.verifyAccess).toBeCalledWith(
      payload.replyId,
      payload.user,
    );
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(
      payload.replyId,
    );
  });
});
