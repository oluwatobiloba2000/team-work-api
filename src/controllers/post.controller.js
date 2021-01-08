/* eslint-disable max-len */
import dotenv from 'dotenv';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';

dotenv.config();
class Post {
  /**
   *  @description   view a user profile
   *  @param { object }
   *
   *  @returns { object } - full details of user's profile
   * */
  static async CreatePost(req, res) {
    const { id: userId } = req.user;
    const { orgId: organizationId } = req.params;
    const {
      article, gif, privacy,
    } = req.body;
    try {
      if (!userId || !(article || gif) || !organizationId || !privacy) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      // upload gif
      const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);
      if (checkIfOrgExist.rows[0]) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
        if (checkIfUserIsAmember.rows[0]) {
          const postCreated = await pool.query('INSERT INTO post (article, gif, user_id, organization_id, privacy) VALUES($1, $2, $3, $4, $5) RETURNING *', [article, gif, userId, organizationId, privacy]);
          const fetchPoster = await pool.query('SELECT username, firstname, lastname, profile_img FROM users WHERE id=$1', [userId]);
          return httpResponse.success(res, 200, 'post created successfully', { ...postCreated.rows[0], ...fetchPoster.rows[0] });
        }
        return httpResponse.success(res, 404, 'user not found');
      }
      return httpResponse.success(res, 200, 'no org found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   update a user profile
   *  @param { object }
   *
   *  @returns { object } - updated version of the profile
   * */
  static async Update(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;
    const {
      article, gif, privacy,
    } = req.body;
    try {
      if (!userId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const post = await pool.query('SELECT * FROM post WHERE id=$1 ', [postId]);
      if (post.rows[0] && post.rows[0].user_id === userId) {
        const newArticle = article || post.rows[0].article;
        const newGif = gif || post.rows[0].gif;
        const newPrivacy = privacy || post.rows[0].privacy;
        const postUpdated = await pool.query('UPDATE post SET article=$1, gif=$2, privacy=$3, isedited=true, editedat=NOW() WHERE id=$4 RETURNING *', [newArticle, newGif, newPrivacy, postId]);
        return httpResponse.success(res, 200, 'post updated successfully', postUpdated.rows);
      }
      return httpResponse.success(res, 200, 'task failed');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   update a user profile
   *  @param { object }
   *
   *  @returns { object } - updated version of the profile
   * */
  static async deletePost(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;
    try {
      if (!userId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const post = await pool.query('SELECT * FROM post WHERE id=$1 ', [postId]);
      if (post.rows[0] && post.rows[0].user_id === userId) {
        await pool.query('DELETE FROM post WHERE id=$1', [postId]);
        return httpResponse.success(res, 200, 'post deleted successfully', null);
      }
      return httpResponse.success(res, 200, 'task failed');
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
  static async postFeed(req, res) {
    const { id: userId } = req.user;
    const start = req.query.start || 0;
    const count = req.query.count || 20;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId || !organizationId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);
      if (checkIfOrgExist.rows[0]) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
        if (checkIfUserIsAmember.rows) {
          const fetchPosts = await pool.query(`SELECT p.organization_id, p.article, p.gif, p.editedat, p.privacy,
                                 p.isedited, p.createdat, p.is_in_appropriate, p.id AS post_id, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname,
                                (SELECT count(*) FROM comment WHERE post_id = p.id) AS comment_count FROM post p
           FULL OUTER JOIN users u ON p.user_id = u.id
           WHERE p.organization_id = $1 AND p.privacy = $2 ORDER BY p.createdat DESC OFFSET($3) LIMIT($4)`, [organizationId, false, start, count]);
          return httpResponse.success(res, 200, 'all posts', fetchPosts.rows);
        }
      }
      return httpResponse.success(res, 200, 'no org found');
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
  static async postByTagFeed(req, res) {
    const { id: userId } = req.user;
    const { tag } = req.query;
    const start = req.query.start || 0;
    const count = req.query.count || 20;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId || !organizationId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);
      if (checkIfOrgExist.rows[0]) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
        if (checkIfUserIsAmember.rows) {
          const fetchPosts = await pool.query(`SELECT p.organization_id, p.article, p.gif, p.editedat, p.privacy,
                                 p.isedited, p.createdat, p.is_in_appropriate, p.id AS post_id, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname,
                                (SELECT count(*) FROM comment WHERE post_id = p.id) AS comment_count FROM post p
           FULL OUTER JOIN users u ON p.user_id = u.id
           WHERE p.organization_id = $1 AND p.privacy = $2 AND p.article ILIKE '%${tag}%' ORDER BY p.createdat DESC OFFSET($3) LIMIT($4)`, [organizationId, false, start, count]);
          return httpResponse.success(res, 200, `all posts with tag ${tag}`, fetchPosts.rows);
        }
      }
      return httpResponse.success(res, 404, 'no org found');
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
  static async singlePost(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;

    try {
      if (!userId || !postId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfPostExist = await pool.query('SELECT *, u.firstname, u.lastname FROM post p INNER JOIN users u ON p.user_id = u.id WHERE p.id=$1', [postId]);
      if (checkIfPostExist.rows[0]) {
        const commentCount = await pool.query('SELECT count(*) FROM comment c WHERE post_id = $1 ', [postId]);
        return httpResponse.success(res, 200, 'post', { post: checkIfPostExist.rows, comentCount: commentCount.rows[0] });
      }
      return httpResponse.success(res, 200, 'no post found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   flag a post as inappropriate
   *  @param { object }
   *
   *  @returns { object } - flagged post
   * */
  static async flagPostAsInAppropriate(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;

    try {
      if (!userId || !postId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const post = await pool.query('SELECT * FROM post WHERE id=$1 ', [postId]);
      if (post.rows[0]) {
        const postFlagged = await pool.query('UPDATE post SET is_in_appropriate=true WHERE id=$1 RETURNING *', [postId]);
        return httpResponse.success(res, 200, 'post flagged successfully', postFlagged.rows);
      }
      return httpResponse.success(res, 404, 'post not found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }
}

export default Post;
