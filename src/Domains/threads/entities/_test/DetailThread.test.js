const DetailThread = require('../DetailThread');

describe('an AddedThread entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange

    const payload = {
      id: 'thread-123',
      title: 'Lorem ipsum dolor sit amet, consectetur',
      body: 'The thread added sit amet',
      date: '2022-06-02T04:54:33.160Z',
    };

    // action and assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has invalid data type', () => {
    // arrange
    const payload = {
      id: 345,
      title: 1984,
      body: [],
      date: 1980,
      username: {},
      comments: 'comments',
    };

    // action and assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Lorem ipsum dolor sit amet, consectetur',
      body: 'The thread added sit amet',
      date: '2022-06-02T04:54:33.160Z',
      username: 'John Doe',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
