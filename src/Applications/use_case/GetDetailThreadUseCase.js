class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  // untuk menampung data yang masuk.
  async execute(payload) {
    // Get data Thread and Comment from Thread ID
    const dataThread = await this._threadRepository.getThreadById(payload);
    const dataComment = await this._threadRepository.getCommentsByThreadId(payload);

    // Get Comment ID
    const commentIds = dataComment.map((comment) => comment.id);

    // Get Reply from Comment ID and Thread ID
    const dataReply = await this._threadRepository.getRepliesByThreadCommentId(payload, commentIds);

    // Save data Comment to data Thread
    dataThread.comments = dataComment.map((k) => ({
      ...k,
      content: k.is_delete ? '**komentar telah dihapus**' : k.content,
    }));

    // Save data Reply to data Thread
    for (let i = 0; i < dataThread.comments.length; i += 1) {
      dataThread.comments[i].replies = dataReply
        .filter((reply) => reply.comment_id === dataThread.comments[i].id)
        .map((k) => ({
          ...k,
          content: k.is_delete ? '**balasan telah dihapus**' : k.content,
        }));
    }

    return dataThread;
  }
}

module.exports = GetDetailThreadUseCase;
