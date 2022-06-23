class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    await this._replyRepository.verifyReplyById(payload.replyId);

    await this._replyRepository.verifyAccess(payload.replyId, payload.user);

    await this._replyRepository.deleteReplyById(payload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
