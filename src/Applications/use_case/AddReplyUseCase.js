const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    return this._replyRepository.addReply(new AddReply(payload));
  }
}

module.exports = AddReplyUseCase;
