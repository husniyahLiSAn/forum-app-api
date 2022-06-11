class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, threadId, owner } = payload;

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({ content, threadId, owner }) {
    return (!content || !owner || !threadId);
  }

  _isPayloadNotMeetDataTypeSpecification({ content, threadId, owner }) {
    return (
      typeof content !== 'string'
      || typeof owner !== 'string'
      || typeof threadId !== 'string'
    );
  }
}

module.exports = AddComment;
