const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  // PUT
  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const payload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
    };

    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    await likeCommentUseCase.execute({ ...payload, userId });

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
