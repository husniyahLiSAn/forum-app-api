const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    threadRepository, commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    await this._threadRepository.verifyThreadById(payload.threadId);
    return this._commentRepository.addComment(new AddComment(payload));
  }
}

module.exports = AddCommentUseCase;
