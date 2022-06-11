const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Generate stone trademark',
      date: '2022-06-04T03:28:30.111Z',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const expectedAddedReply = new AddedReply({ ...payload });

    /* create dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /* mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    /* create use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(payload);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      id: 'reply-123',
      content: 'Generate stone trademark',
      date: '2022-06-04T03:28:30.111Z',
      owner: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    }));
  });
});
