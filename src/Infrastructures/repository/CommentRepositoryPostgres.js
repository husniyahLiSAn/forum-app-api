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

    // VERIFY Thread ID
    const checkThread = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };
    const resultThread = await this._pool.query(checkThread);
    if (!resultThread.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

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
