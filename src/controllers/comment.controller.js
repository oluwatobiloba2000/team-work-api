/* eslint-disable max-len */
import dotenv from 'dotenv';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';

dotenv.config();
class Comment {
  /**
   *  @description   view a post comment
   *  @param { object }
   *
   *  @returns { object } - comments
   * */
  static async CreateComment(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;
    const { comment } = req.body;
    try {
      if (!userId || !comment || !postId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfPostExist = await pool.query('SELECT * FROM post WHERE id=$1', [postId]);
      if (checkIfPostExist.rows[0]) {
        const commentCreated = await pool.query('INSERT INTO comment (comment, post_id, user_id) VALUES($1, $2, $3) RETURNING *', [comment, postId, userId]);
        return httpResponse.success(res, 200, 'post created successfully', commentCreated.rows);
      }
      return httpResponse.success(res, 200, 'no post found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   delete a comment
   *  @param { object }
   *
   *  @returns { object } - updated version of the profile
   * */
  static async deleteComment(req, res) {
    const { id: userId } = req.user;
    const { commentId } = req.params;
    try {
      if (!userId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const comment = await pool.query('SELECT * FROM comment WHERE id=$1 ', [commentId]);
      if (comment.rows[0] && comment.rows[0].user_id === userId) {
        await pool.query('DELETE FROM comment WHERE id=$1', [commentId]);
        return httpResponse.success(res, 200, 'comment deleted successfully', null);
      }
      return httpResponse.success(res, 200, 'comment not found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view a user profile
   *  @param { object }
   *
   *  @returns { object } - full details of user's profile
   * */
  static async commentFeed(req, res) {
    const { id: userId } = req.user;
    const start = req.query.start || 0;
    const count = req.query.count || 20;
    const { postId } = req.params;

    try {
      if (!userId || !postId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfPostExist = await pool.query('SELECT * FROM post WHERE id=$1', [postId]);
      if (checkIfPostExist.rows[0]) {
        const fetchPostOwnerComments = await pool.query(`SELECT c.createdat, c.is_in_appropriate, c.id AS comment_id, c.comment, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname
        FROM comment c INNER JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 AND c.user_id = $2  ORDER BY c.createdat`, [postId, userId]);
        const fetchComment = await pool.query(`SELECT c.createdat, c.is_in_appropriate, c.id AS comment_id, c.comment, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname
         FROM comment c INNER JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 AND NOT (c.user_id = u.id) ORDER BY c.createdat DESC OFFSET($2) LIMIT($3)`, [postId, start, count]);
        return httpResponse.success(res, 200, 'comments', { postOwnerComments: fetchPostOwnerComments.rows, comments: fetchComment.rows });
      }
      return httpResponse.success(res, 200, 'no post found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }
}

export default Comment;
