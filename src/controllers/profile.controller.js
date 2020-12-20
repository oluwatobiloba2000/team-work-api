/* eslint-disable max-len */
import dotenv from 'dotenv';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';

dotenv.config();
class ProfileController {
  /**
   *  @description   view a user profile
   *  @param { object }
   *
   *  @returns { object } - full details of user's profile
   * */
  static async View(req, res) {
    const { id: userId } = req.user;

    try {
      if (!userId) return httpResponse.error(res, 400, 'all fields required', true);
      const selectProfileQuery = 'SELECT * FROM users WHERE id=$1';
      const selectProfileValue = [userId];
      const profile = await pool.query(selectProfileQuery, selectProfileValue);
      if (profile.rows) {
        return httpResponse.success(res, 200, 'profile fetched successfully', profile.rows);
      }
      return httpResponse.success(res, 200, 'no profile found');
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
    const {
      profileImg, headerImg, firstname, lastname,
    } = req.body;

    try {
      if (!userId) return httpResponse.error(res, 400, 'all fields required', true);
      const selectProfileQuery = 'SELECT * FROM users WHERE id=$1';
      const selectProfileValue = [userId];
      const profile = await pool.query(selectProfileQuery, selectProfileValue);
      if (profile.rows) {
        const newProfileImg = profileImg || profile.rows[0].profile_img;
        const newHeaderImg = headerImg || profile.rows[0].header_img;
        const newFirstName = firstname || profile.rows[0].firstname;
        const newLastName = lastname || profile.rows[0].lastname;
        const updateProfile = await pool.query('UPDATE users SET profile_img=$1, header_img=$2, firstname=$3, lastname=$4 WHERE id=$5 RETURNING *', [newProfileImg, newHeaderImg, newFirstName, newLastName, userId]);
        return httpResponse.success(res, 200, 'profile updated successfully', updateProfile.rows);
      }
      return httpResponse.success(res, 200, 'no profile found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   A a user
   *  @param { object }
   *
   *  @returns { object }
   * */
  static async AcceptInviteToJoinOrg(req, res) {
    const { id: userId, email } = req.user;
    const { jobRole, department } = req.body;

    const { invitekey } = req.query;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId || !email || !invitekey || !organizationId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfUserExist = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
      if (checkIfUserExist.rows[0]) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE email=$1 AND invite_key=$2 AND organization_id=$3', [email, invitekey, organizationId]);
        if (checkIfUserIsAmember.rows[0] && checkIfUserIsAmember.rows[0].has_joined === false && checkIfUserIsAmember.rows[0].email === email) {
          const insertUserToOrg = await pool.query('INSERT INTO organizationMembers (email, user_id, has_joined, organization_id, jobRole, department) VALUES($1, $2, $3, $4) RETURNING *', [email, userId, true, organizationId, jobRole, department]);
          if (insertUserToOrg.rows[0]) {
            return httpResponse.success(res, 200, 'user Joined successfully', insertUserToOrg.rows[0]);
          }
          return httpResponse.error(res, 500, 'task failed', true);
        }
        return httpResponse.error(res, 400, 'user is already in the organization or invalid user', true);
      }
      return httpResponse.error(res, 400, 'users does not exist', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   A a user
   *  @param { object }
   *
   *  @returns { object }
   * */
  static async JoinOpenOrg(req, res) {
    const { id: userId, email } = req.user;
    const { jobRole, department } = req.body;
    const { orgId: organizationId } = req.params;

    try {
      if (!userId || !email || !organizationId) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }
      const checkIfUserExist = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
      if (checkIfUserExist.rows[0]) {
        const checkIfUserIsAmember = await pool.query('SELECT * FROM organizationMembers WHERE email=$1 AND organization_id=$2', [email, organizationId]);
        if (!checkIfUserIsAmember.rows[0]) {
          const checkIfOrgIsPublic = await pool.query('SELECT * FROM organization WHERE organization_id=$1', [organizationId]);
          // eslint-disable-next-line eqeqeq
          if (checkIfOrgIsPublic.rows[0].isprivate == false) {
            const insertUserToOrg = await pool.query('INSERT INTO organizationMembers (email, user_id, has_joined, organization_id, jobRole, department) VALUES($1, $2, $3, $4) RETURNING *', [email, userId, true, organizationId, jobRole, department]);
            return httpResponse.success(res, 200, 'user Joined successfully', insertUserToOrg.rows[0]);
          }
          return httpResponse.error(res, 500, 'org is private', true);
        }
        return httpResponse.error(res, 400, 'user is already in the organization or invalid user', true);
      }
      return httpResponse.error(res, 400, 'users does not exist', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }
}

export default ProfileController;
