const DetailComment = require('../DetailComment');

describe('a DetailComment entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange
    const payload = {
      id: 'comment-123',
      username: 'Somebody comment please',
      date: 'thread-123,',
    };

    // action & assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload has invalid data type', () => {
    const payload = {
      id: 123,
      username: [],
      date: 2022,
      content: { },
      replies: 'replies',
      isDelete: 234,
    };

    // action & assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object properly when the comment isn\'t deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'unknown user55',
      date: 'thread-123,',
      content: 'Content of comment',
      replies: [],
      isDelete: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.replies).toEqual(payload.replies);
  });

  it('should create DetailComment object properly when the comment is deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'unknown user55',
      date: 'thread-123,',
      content: 'Dunno for the comment',
      replies: [],
      isDelete: true,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
    expect(detailComment.replies).toEqual(payload.replies);
  });
});
