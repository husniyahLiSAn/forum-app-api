class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.content = payload.isDelete ? '**balasan telah dihapus**' : payload.content;
    this.date = payload.date;
    this.username = payload.username;
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
    id, content, date, username,
  }) {
    return (!id || !content || !date || !username);
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, content, date, username,
  }) {
    return (
      typeof id !== 'string'
        || typeof content !== 'string'
        || typeof date !== 'string'
        || typeof username !== 'string'
    );
  }
}

module.exports = DetailReply;
