const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const now = new Date();
    const payload = {
      id: 'reply-123',
      content: 'Generate stone trademark',
      date: now,
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const expectedAddedReply = new AddedReply({ ...payload });

    /* create dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /* mocking needed function */
    mockCommentRepository.verifyCommentOnThread = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    /* create use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(payload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      id: 'reply-123',
      content: 'Generate stone trademark',
      date: now.toISOString(),
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    }));
  });
});
