class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      id, content, date, username, commentId,
    } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.commentId = commentId;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, content, date, username, commentId,
  }) {
    return (!id || !content || !date || !username || !commentId);
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, content, date, username, commentId,
  }) {
    return (
      typeof id !== 'string'
        || typeof content !== 'string'
        || typeof date !== 'string'
        || typeof username !== 'string'
        || typeof commentId !== 'string'
    );
  }
}

module.exports = DetailReply;
