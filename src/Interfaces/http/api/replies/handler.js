const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  // POST
  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const payload = {
      content: request.payload.content,
      threadId: request.params.threadId,
      commentId: request.params.commentId,
    };

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({ ...payload, owner });

    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  // DELETE
  async deleteReplyHandler(request, h) {
    const { id: user } = request.auth.credentials;
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      replyId: request.params.replyId,
    };

    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({ ...payload, user });

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
