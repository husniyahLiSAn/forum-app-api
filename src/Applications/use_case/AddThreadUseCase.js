const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this.threadRepository = threadRepository;
  }

  async execute(payload) {
    const addThread = new AddThread(payload);

    return this.threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
