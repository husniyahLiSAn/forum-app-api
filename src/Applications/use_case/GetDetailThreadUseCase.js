class GetDetailThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  // untuk menampung data yang masuk.
  async execute(payload) {
    // Get data Thread and Comment from Thread ID
    await this._threadRepository.verifyThreadById(payload);
    const dataThread = await this._threadRepository.getDetailThreadById(payload);
    const dataComments = await this._commentRepository.getCommentsByThreadId(payload);

    // Get Comment ID
    const commentIds = dataComments.map((comment) => comment.id);

    // Get Reply from Comment ID and Thread ID
    const dataReplies = await this._replyRepository
      .getRepliesByThreadCommentId(payload, commentIds);

    // Save data comments and replies to data Thread
    dataThread.comments = dataComments.map((comment) => {
      const replies = dataReplies.filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        }));

      return ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        replies,
      });
    });

    return dataThread;
  }
}

module.exports = GetDetailThreadUseCase;
