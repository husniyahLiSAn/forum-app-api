const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    commentRepository, replyRepository,
  }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    await this._commentRepository.verifyCommentOnThread(payload.threadId, payload.commentId);
    return this._replyRepository.addReply(new AddReply(payload));
  }
}

module.exports = AddReplyUseCase;
