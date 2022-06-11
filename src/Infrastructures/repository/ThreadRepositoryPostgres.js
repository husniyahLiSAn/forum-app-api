const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
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
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  // GET Thread
  async getThreadById(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads 
            LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return result.rows[0];
  }

  // GET Comment
  async getCommentsByThreadId(id) {
    const query = {
      text: `SELECT comments.*, users.username 
            FROM comments LEFT JOIN users ON users.id = comments.owner
            WHERE comments.thread_id = $1 
            ORDER BY date ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  // GET Reply
  async getRepliesByThreadId(id) {
    const query = {
      text: `SELECT replies.*, users.username 
          FROM replies 
          INNER JOIN comments ON replies.comment_id = comments.id
          INNER JOIN users ON replies.owner = users.id
          WHERE comments.thread_id = $1
          ORDER BY date ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }
}

module.exports = ThreadRepositoryPostgres;
