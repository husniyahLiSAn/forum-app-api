class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  // untuk menampung data yang masuk.
  async execute(payload) {
    const dataThread = await this._threadRepository.getThreadById(payload);
    const dataComment = await this._threadRepository.getCommentsByThreadId(payload);
    const dataReply = await this._threadRepository.getRepliesByThreadId(payload);

    dataThread.comments = dataComment.map((k) => ({
      ...k,
      content: k.is_delete ? '**komentar telah dihapus**' : k.content,
    }));

    if (dataReply.length > 0) {
      for (let i = 0; i < dataThread.comments.length; i += 1) {
        dataThread.comments[i].replies = dataReply
          .filter((j) => j.comment_id === dataThread.comments[i].id)
          .map((k) => ({
            ...k,
            content: k.is_delete ? '**balasan telah dihapus**' : k.content,
          }));
      }
    }

    return dataThread;
  }
}

module.exports = GetDetailThreadUseCase;
