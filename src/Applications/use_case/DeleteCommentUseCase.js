class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    await this._commentRepository.verifyAccess(payload.commentId, payload.user);

    return this._commentRepository.deleteCommentById(payload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
