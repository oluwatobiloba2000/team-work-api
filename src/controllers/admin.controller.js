/* eslint-disable max-len */
import dotenv from 'dotenv';
import randomString from 'randomstring';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';
import EmailSender from '../services/emailSender';

dotenv.config();
class Admin {
  /**
   *  @description   view a user profile
   *  @param { object }
   *
   *  @returns { object } - full details of user's profile
   * */
  static async viewFlaggedPosts(req, res) {
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
        const checkIfUserIsAmemberAndAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
        if (checkIfUserIsAmemberAndAdmin.rows[0] && (checkIfUserIsAmemberAndAdmin.rows[0].organization_id === organizationId && checkIfUserIsAmemberAndAdmin.rows[0].isadmin)) {
          const fetchFlaggedPosts = await pool.query(`SELECT p.organization_id, p.article, p.gif, p.editedat, p.privacy,
              p.isedited, p.createdat, p.is_in_appropriate, p.id AS post_id, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname,
              (SELECT count(*) FROM comment WHERE post_id = p.id) AS comment_count FROM post p
              FULL OUTER JOIN users u ON p.user_id = u.id
              WHERE p.organization_id = $1 AND p.privacy = $2 AND p.is_in_appropriate=true ORDER BY p.createdat DESC OFFSET($3) LIMIT($4)`, [organizationId, false, start, count]);
          return httpResponse.success(res, 200, 'all flagged posts', fetchFlaggedPosts.rows);
        }
        return httpResponse.error(res, 400, 'user is not an admin', true);
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
  static async viewFlaggedComments(req, res) {
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
        const checkIfUserIsAmemberAndAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
        if (checkIfUserIsAmemberAndAdmin.rows[0] && (checkIfUserIsAmemberAndAdmin.rows[0].organization_id === organizationId && checkIfUserIsAmemberAndAdmin.rows[0].isadmin)) {
          const fetchFlaggedPosts = await pool.query(`SELECT p.organization_id, p.article, p.gif, p.createdat, p.is_in_appropriate, p.id AS post_id, u.id AS user_id, u.username, u.profile_img, u.firstname, u.lastname, c.id AS comment_id, c.comment AS comment_flagged FROM comment c
                INNER JOIN users u ON c.user_id = u.id
                INNER JOIN post p ON c.post_id = p.id
                WHERE p.organization_id = $1 AND c.is_in_appropriate=true ORDER BY c.createdat DESC OFFSET($2) LIMIT($3)`, [organizationId, start, count]);
          return httpResponse.success(res, 200, 'all flagged comments', fetchFlaggedPosts.rows);
        }
        return httpResponse.error(res, 400, 'user is not an admin', true);
      }
      return httpResponse.success(res, 200, 'no org found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   delete flagged post
   *  @param { object }
   *
   *  @returns { object }
   * */
  static async deleteFlaggedPost(req, res) {
    const { id: userId } = req.user;
    const { postId } = req.params;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfUserIsAmemberAndAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
      if (checkIfUserIsAmemberAndAdmin.rows[0] && (checkIfUserIsAmemberAndAdmin.rows[0].organization_id === organizationId && checkIfUserIsAmemberAndAdmin.rows[0].isadmin)) {
        const post = await pool.query('SELECT * FROM post WHERE id=$1 ', [postId]);
        if (post.rows[0] && post.rows[0].is_in_appropriate === true) {
          await pool.query('DELETE FROM post WHERE id=$1', [postId]);
          return httpResponse.success(res, 200, 'post deleted successfully', null);
        }
        return httpResponse.error(res, 400, 'post is not inappropriate', true);
      }
      return httpResponse.error(res, 400, 'user is not an admin', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   delete flagged comment
   *  @param { object }
   *
   *  @returns { object }
   * */
  static async deleteFlaggedComment(req, res) {
    const { id: userId } = req.user;
    const { commentId } = req.params;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfUserIsAmemberAndAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);
      if (checkIfUserIsAmemberAndAdmin.rows[0] && (checkIfUserIsAmemberAndAdmin.rows[0].organization_id === organizationId && checkIfUserIsAmemberAndAdmin.rows[0].isadmin)) {
        const comment = await pool.query('SELECT * FROM comment WHERE id=$1 ', [commentId]);
        if (comment.rows[0] && comment.rows[0].is_in_appropriate === true) {
          await pool.query('DELETE FROM post WHERE id=$1', [commentId]);
          return httpResponse.success(res, 200, 'comment deleted successfully', null);
        }
        return httpResponse.error(res, 400, 'commwnt is not inappropriate', true);
      }
      return httpResponse.error(res, 400, 'user is not an admin', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   Invite a user
   *  @param { object }
   *
   *  @returns { object }
   * */
  static async inviteUser(req, res) {
    const { id: userId } = req.user;
    const { email } = req.body;
    const { orgId: organizationId } = req.params;
    const inviteKey = randomString.generate();

    try {
      if (!userId || !email || !organizationId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfUserIsAmemberAndAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, organizationId]);

      if (checkIfUserIsAmemberAndAdmin.rows[0] && (checkIfUserIsAmemberAndAdmin.rows[0].organization_id === organizationId && checkIfUserIsAmemberAndAdmin.rows[0].isadmin)) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE email=$1 AND organization_id=$2', [email, organizationId]);
        const OrgDetails = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);

        if (!checkIfUserIsAmember.rows[0]) {
          const insertUserToOrg = await pool.query('INSERT INTO organizationMembers (invite_key, email, organization_id) VALUES($1, $2, $3) RETURNING *', [inviteKey, email, organizationId]);
          if (insertUserToOrg.rows[0]) {
            EmailSender.sendInviteMails(email, organizationId, OrgDetails.rows[0].name, insertUserToOrg.rows[0].invite_key);
            return httpResponse.success(res, 200, 'user Invited successfully', { invitedUser: insertUserToOrg.rows[0], inviteLink: `/accept/invite?email=${email}&organizationID=${insertUserToOrg.rows[0].organization_id}&org=${OrgDetails.rows[0].name}&inviteKey=${insertUserToOrg.rows[0].invite_key}` });
          }
          return httpResponse.error(res, 400, 'task failed', true);
        }
        return httpResponse.error(res, 400, 'user is already in the organization', true);
      }
      return httpResponse.error(res, 400, 'opration is only for admins', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }
}

export default Admin;
