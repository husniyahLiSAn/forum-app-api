const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  // VERIFY COMMENT ALREADY LIKED
  async checkCommentAlreadyLiked(commentId, userId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id=$1 AND owner=$2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // ADD LIKE TO COMMENT
  async addLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) returning comment_id, owner',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  // REMOVE LIKE FROM COMMENT
  async removeLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id=$1 AND owner=$2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  // COUNT LIKE ON COMMENT_ID
  async countLikes(commentIds) {
    const query = {
      text: 'SELECT comment_id, COUNT(*) FROM likes WHERE comment_id=ANY($1::text[]) GROUP BY comment_id',
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
