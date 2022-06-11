const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    return this._commentRepository.addComment(new AddComment(payload));
  }
}

module.exports = AddCommentUseCase;
