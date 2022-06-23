const DetailReply = require('../DetailReply');

describe('a DetailReply entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange
    const payload = {
      id: 'reply-123',
      content: 'Rabbit Message',
      date: '2022',
    };

    // action & assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload has invalid data type', () => {
    const payload = {
      id: 123,
      content: 145,
      date: {},
      username: [],
      isDelete: 234,
    };

    // action & assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply object properly when the reply isn\'t deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'Message Brief',
      date: '2022',
      username: 'John Doe',
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });

  it('should create DetailReply object properly when the reply is deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'Toccast Message',
      date: '2022',
      username: 'John Doe',
      isDelete: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
});
