const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  // ADD
  async addComment(data) {
    const { content, owner, threadId } = data;
    const id = `comment-${this._idGenerator(10)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  // VERIFY
  async verifyAccess(id, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    const comment = result.rows[0];
    if (comment.owner !== userId) {
      throw new AuthorizationError('Proses gagal! Anda tidak berhak mengakses komentar ini');
    }
  }

  // VERIFY AVAILABLITY COMMENT AND THREAD ID
  async verifyCommentOnThread(threadId, commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1 AND id = $2',
      values: [threadId, commentId],
    };

    const res = await this._pool.query(query);
    if (!res.rowCount) {
      throw new NotFoundError('Komentar pada Thread tidak ditemukan');
    }
  }

  // GET
  async getCommentById(id) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date,
            CASE WHEN comments.is_delete THEN '**komentar telah dihapus**' else comments.content END AS content
            FROM comments LEFT JOIN users ON comments.owner = users.id 
            WHERE comments.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return result.rows[0];
  }

  // GET Comment by Thread ID
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

  // DELETE
  async deleteCommentById(id) {
    const query = {
      text: `UPDATE comments SET 
            is_delete = true
            WHERE id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return { status: 'success' };
  }
}

module.exports = CommentRepositoryPostgres;
