/* eslint-disable max-len */
import dotenv from 'dotenv';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';

dotenv.config();
class organizationController {
  /**
   *  @description   create an organization
   *  @param { object }
   *
   *  @returns { object } - org created
   * */
  static async Create(req, res) {
    const {
      name, orgImg, description, headerImg, isPrivate,
    } = req.body;
    const { id: userId, email } = req.user;

    try {
      if (!name || !description || !(isPrivate === true || isPrivate === false)) {
        return httpResponse.error(res, 400, 'all fields required', true);
      }

      // eslint-disable-next-line max-len
      const insertQuery = 'INSERT INTO organization (name,description, header_img,org_img, isPrivate) VALUES($1, $2, $3, $4, $5) RETURNING *';
      const insertValue = [name, description, headerImg, orgImg, isPrivate];
      const newOrganization = await pool.query(insertQuery, insertValue);

      const insertOrgMemberQuery = 'INSERT INTO organizationMembers (user_id, has_joined, email, organization_id ,isAdmin, org_owner) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
      const insertOrgMemberValue = [userId, true, email, newOrganization.rows[0].id, true, true];
      const newMemberOrganization = await pool.query(insertOrgMemberQuery, insertOrgMemberValue);

      return httpResponse.success(res, 200, 'organization created successfully', {
        organization: newOrganization.rows,
        member: newMemberOrganization.rows,
      });
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view all organization for a user
   *  @param { object }
   *
   *  @returns { object } - org created
   * */

  static async AllUserOrg(req, res) {
    const { id, email } = req.user;
    try {
      if (!id) return httpResponse.error(res, 400, 'all fields required', true);
      const selectOrgQuery = 'SELECT * FROM organizationMembers orgMembers INNER JOIN organization org ON orgMembers.organization_id = org.id WHERE user_id=$1 ORDER BY orgMembers.createdat';
      const selectOrgValue = [id];
      const allOrg = await pool.query(selectOrgQuery, selectOrgValue);
      const pendingInvititationToOrg = await pool.query('SELECT * FROM organizationMembers orgMembers INNER JOIN organization org ON orgMembers.organization_id = org.id WHERE email=$1 AND has_joined=false', [email]);
      if (allOrg.rows) {
        return httpResponse.success(res, 200, 'all organizations', { all_active_organization: allOrg.rows, all_pending_org: pendingInvititationToOrg.rows.length !== 0 ? pendingInvititationToOrg.rows : 'no pending org' });
      }
      return httpResponse.success(res, 404, 'no org found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view all organization for a user
   *  @param { object }
   *
   *  @returns { object } - org created
   * */

  static async FetchAllPublicOrgs(req, res) {
    const { id, email } = req.user;
    try {
      if (!id || !email) return httpResponse.error(res, 400, 'all fields required', true);
      const selectOrgQuery = 'SELECT *, (SELECT COUNT(*) FROM organizationMembers orgMembers WHERE org.id = orgMembers.organization_id) AS members_count FROM organization org WHERE isprivate = false ORDER BY org.createdat';
      const allOpenOrg = await pool.query(selectOrgQuery);
      if (allOpenOrg.rows[0]) {
        return httpResponse.success(res, 200, 'all organizations', allOpenOrg.rows);
      }
      return httpResponse.success(res, 404, 'no public organization found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view all organization for a user
   *  @param { object }
   *
   *  @returns { object } - org created
   * */

  static async orgDetails(req, res) {
    const { id } = req.user;
    const { orgId: organizationId } = req.params;

    try {
      if (!id) return httpResponse.error(res, 400, 'all fields required', true);
      const orgDetails = await pool.query('SELECT *, (SELECT COUNT(*) FROM organizationMembers WHERE organization_id=$1 AND has_joined=true) AS org_members FROM organization org WHERE id=$1', [organizationId]);
      const currentUserMemberDetails = await pool.query('SELECT * FROM organizationMembers WHERE organization_id=$1 AND user_id=$2', [organizationId, id]);
      if (orgDetails.rows[0]) {
        return httpResponse.success(res, 200, 'organization details', { orgDetails: orgDetails.rows, currentUserMemberDetails : currentUserMemberDetails.rows });
      }
      return httpResponse.success(res, 404, 'no org found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   assign a user as an admin
   *  @param { object }
   *
   *  @returns { object } - org created
   * */
  static async AssignAdmin(req, res) {
    const { userId } = req.params;
    const { orgId } = req.params;
    const { id: currentLoggedUserId } = req.user;
    try {
      if (!userId || !orgId || !currentLoggedUserId) return httpResponse.error(res, 400, 'all fields required', true);

      const checkIfCurrentUserIsAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [currentLoggedUserId, orgId]);
      if (checkIfCurrentUserIsAdmin.rows[0] && checkIfCurrentUserIsAdmin.rows[0].isadmin) {
        const checkUserToAssign = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, orgId]);
        if (checkUserToAssign.rows[0]) {
          const assignUser = await pool.query('UPDATE organizationMembers SET isAdmin = true WHERE organization_id=$1 AND user_id=$2 RETURNING *', [orgId, userId]);
          return httpResponse.success(res, 200, 'user successfully assigned to an admin role', assignUser.rows[0]);
        }
        return httpResponse.error(res, 404, 'user is not in this org', true);
      }

      return httpResponse.error(res, 400, 'only admins can perform this task', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error.message}`,
      });
    }
  }

  /**
   *  @description   assign a user as an admin
   *  @param { object }
   *
   *  @returns { object } - org created
   * */
  static async DismissAdmin(req, res) {
    const { userId } = req.params;
    const { orgId } = req.params;
    const { id: currentLoggedUserId } = req.user;
    try {
      if (!userId || !orgId || !currentLoggedUserId) return httpResponse.error(res, 400, 'all fields required', true);

      const checkIfCurrentUserIsAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [currentLoggedUserId, orgId]);
      if (checkIfCurrentUserIsAdmin.rows[0] && checkIfCurrentUserIsAdmin.rows[0].isadmin && checkIfCurrentUserIsAdmin.rows[0].org_owner) {
        const checkUserToAssign = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [userId, orgId]);
        if (checkUserToAssign.rows[0]) {
          const assignUser = await pool.query('UPDATE organizationMembers SET isAdmin = false WHERE organization_id=$1 AND user_id=$2 RETURNING *', [orgId, userId]);
          return httpResponse.success(res, 200, 'user successfully dismissed from an admin role', assignUser.rows[0]);
        }
        return httpResponse.error(res, 404, 'user is not in this org', true);
      }

      return httpResponse.error(res, 400, 'only organization owners can perform this task', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error.message}`,
      });
    }
  }

  /**
   *  @description   assign a user as an admin
   *  @param { object }
   *
   *  @returns { object } - org created
   * */
  static async Privacy(req, res) {
    const { orgId } = req.params;
    const { id: currentLoggedUserId } = req.user;
    try {
      if (!orgId || !currentLoggedUserId) return httpResponse.error(res, 400, 'all fields required', true);

      const checkIfCurrentUserIsAdmin = await pool.query('SELECT * FROM organizationMembers WHERE user_id=$1 AND organization_id=$2', [currentLoggedUserId, orgId]);
      if (checkIfCurrentUserIsAdmin.rows[0] && checkIfCurrentUserIsAdmin.rows[0].organization_id === orgId && checkIfCurrentUserIsAdmin.rows[0].isadmin && checkIfCurrentUserIsAdmin.rows[0].org_owner) {
        const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [orgId]);
        if (checkIfOrgExist.rows[0]) {
          const changeOrgPrivacy = await pool.query('UPDATE organization SET isPrivate = $1 WHERE id=$2 RETURNING *', [!checkIfOrgExist.rows[0].isprivate, orgId]);
          return httpResponse.success(res, 200, 'org privacy changed', changeOrgPrivacy.rows[0]);
        }
        return httpResponse.error(res, 404, 'org does not exist', true);
      }

      return httpResponse.error(res, 400, 'only organization owners can perform this task', true);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error.message}`,
      });
    }
  }
}

export default organizationController;
