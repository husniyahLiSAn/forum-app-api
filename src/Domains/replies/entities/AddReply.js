class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      content, owner, threadId, commentId,
    } = payload;

    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
    this.commentId = commentId;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    content, owner, threadId, commentId,
  }) {
    return (!content || !owner || !threadId || !commentId);
  }

  _isPayloadNotMeetDataTypeSpecification({
    content, owner, threadId, commentId,
  }) {
    return (
      typeof content !== 'string'
      || typeof owner !== 'string'
      || typeof threadId !== 'string'
      || typeof commentId !== 'string'
    );
  }
}

module.exports = AddReply;
