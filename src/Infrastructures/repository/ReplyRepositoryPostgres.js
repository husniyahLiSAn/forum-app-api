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
      content, owner, commentId,
    } = data;
    const id = `reply-${this._idGenerator(10)}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  // VERIFY REPLY ID
  async verifyReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }

  // VERIFY ACCESS
  async verifyAccess(id, userId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id=$1 AND owner=$2',
      values: [id, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Proses gagal! Anda tidak berhak mengakses balasan ini');
    }
  }

  // GET Reply By Thread and Comments ID
  async getRepliesByThreadCommentId(threadId, commentIds) {
    const query = {
      text: `SELECT replies.*, users.username 
          FROM replies 
          LEFT JOIN comments ON replies.comment_id = comments.id
          LEFT JOIN users ON replies.owner = users.id
          WHERE comments.thread_id = $1 AND replies.comment_id = ANY($2::text[])
          ORDER BY date`,
      values: [threadId, commentIds],
    };
    const result = await this._pool.query(query);

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

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
