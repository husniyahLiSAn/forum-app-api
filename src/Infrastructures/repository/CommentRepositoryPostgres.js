const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

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

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  // VERIFY COMMENT ID
  async verifyCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  // VERIFY ACCESS
  async verifyAccess(id, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Proses gagal! Anda tidak berhak mengakses komentar ini');
    }
  }

  // VERIFY AVAILABLITY COMMENT AND THREAD ID
  async verifyCommentOnThread(threadId, commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1 AND id = $2',
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar pada Thread tidak ditemukan');
    }
  }

  // GET Comment by Thread ID
  async getCommentsByThreadId(id) {
    const query = {
      text: `SELECT comments.*, users.username 
            FROM comments LEFT JOIN users ON users.id = comments.owner
            WHERE comments.thread_id = $1 
            ORDER BY date`,
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows.map((row) => new DetailComment({
      id: row.id,
      date: row.date.toISOString(),
      username: row.username,
      content: row.content,
      isDelete: row.is_delete,
      replies: [],
    }));
  }

  // DELETE
  async deleteCommentById(id) {
    const query = {
      text: `UPDATE comments SET 
            is_delete = true
            WHERE id = $1`,
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
