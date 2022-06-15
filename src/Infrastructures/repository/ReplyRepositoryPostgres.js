const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  // ADD
  async addReply(data) {
    const {
      content, owner, threadId, commentId,
    } = data;
    const id = `reply-${this._idGenerator(10)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  // VERIFY
  async verifyAccess(id, userId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    const reply = result.rows[0];
    if (reply.owner !== userId) {
      throw new AuthorizationError('Proses gagal! Anda tidak berhak mengakses balasan ini');
    }
  }

  // GET
  async getReplyById(id) {
    const query = {
      text: `SELECT replies.id, 
            CASE WHEN replies.is_delete THEN '**balasan telah dihapus**' else replies.content END AS content,
            replies.date, users.username
            FROM replies LEFT JOIN users ON replies.owner = users.id 
            WHERE replies.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return result.rows[0];
  }

  // GET Reply By Thread and Comments ID
  async getRepliesByThreadCommentId(threadId, commentIds) {
    const query = {
      text: `SELECT replies.*, users.username 
          FROM replies 
          LEFT JOIN comments ON replies.comment_id = comments.id
          LEFT JOIN users ON replies.owner = users.id
          WHERE comments.thread_id = $1 AND replies.comment_id = ANY($2::text[])
          ORDER BY date ASC`,
      values: [threadId, commentIds],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }

    return result.rows;
  }

  // DELETE
  async deleteReplyById(replyId) {
    const query = {
      text: `UPDATE replies SET 
            is_delete = true
            WHERE id = $1`,
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return { status: 'success' };
  }
}

module.exports = ReplyRepositoryPostgres;
