const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  // POST
  async postCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const payload = {
      content: request.payload.content,
      threadId: request.params.threadId,
    };

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({ ...payload, owner });

    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  }

  // DELETE
  async deleteCommentHandler(request, h) {
    const { id: user } = request.auth.credentials;
    const payload = {
      commentId: request.params.commentId,
      threadId: request.params.threadId,
    };

    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute({ ...payload, user });

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
