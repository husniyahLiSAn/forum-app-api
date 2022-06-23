class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.date = payload.date;
    this.username = payload.username;
    this.content = payload.isDelete ? '**komentar telah dihapus**' : payload.content;
    this.replies = payload.replies;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, username, date, content, replies,
  }) {
    return (!id || !username || !date || !content || !replies);
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, username, date, content, replies,
  }) {
    return (
      typeof id !== 'string'
        || typeof username !== 'string'
        || typeof date !== 'string'
        || typeof content !== 'string'
        || !(Array.isArray(replies))
    );
  }
}

module.exports = DetailComment;
