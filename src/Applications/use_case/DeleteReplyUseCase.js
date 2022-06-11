class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    await this._replyRepository.verifyAccess(payload.replyId, payload.user);

    return this._replyRepository.deleteReplyById(payload.replyId);
  }
}

module.exports = DeleteReplyUseCase;
