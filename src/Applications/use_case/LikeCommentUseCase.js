class LikeCommentUseCase {
  constructor({
    commentRepository, likeRepository,
  }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(payload) {
    await this._commentRepository.verifyCommentOnThread(payload.threadId, payload.commentId);
    const likeStatus = await this._likeRepository
      .checkCommentAlreadyLiked(payload.commentId, payload.userId);

    if (likeStatus.length) {
      await this._likeRepository
        .removeLike(payload.commentId, payload.userId);
    } else {
      await this._likeRepository
        .addLike(payload.commentId, payload.userId);
    }
  }
}

module.exports = LikeCommentUseCase;
