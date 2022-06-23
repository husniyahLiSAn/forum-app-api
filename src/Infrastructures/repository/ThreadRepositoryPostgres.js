const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  // ADD
  async addThread(addThread) {
    const { title, body, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread(result.rows[0]);
  }

  // VERIFY THREAD ID
  async verifyThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  // GET DetailThread
  async getDetailThreadById(id) {
    const query = {
      text: `SELECT threads.*, users.username FROM threads 
            LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return new DetailThread({
      id: result.rows[0].id,
      title: result.rows[0].title,
      body: result.rows[0].body,
      date: result.rows[0].date.toISOString(),
      username: result.rows[0].username,
      comments: [],
    });
  }
}

module.exports = ThreadRepositoryPostgres;
