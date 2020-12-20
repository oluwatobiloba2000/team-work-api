/* eslint-disable max-len */
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db/index';
import httpResponse from '../helpers/http-response';

dotenv.config();
class SuperUser {
  /**
  * @static
  *
  * @description signup for users
  * @memberOf Authentication
  */

  static async signup(req, res) {
    const {
      username,
      password,
      email,
      secretKey,
    } = req.body;

    try {
      if (!username || !password || !email) {
        return res.status(400).json({
          message: 'all fields required',
          code: 400,
        });
      }

      const userEmailExist = await pool.query('SELECT * FROM superuser WHERE email=$1', [email]);
      if (userEmailExist.rows[0]) {
        return res.status(400).json({
          message: 'email already taken',
          code: 400,
        });
      }

      if (secretKey !== process.env.SUPERUSER_SIGNUP_KEY) {
        return res.status(400).json({
          message: 'secret key is incorrect',
          code: 400,
        });
      }

      //  hash the incoming password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertedSuperUser = await pool.query('INSERT INTO superuser (username, email, password) VALUES($1, $2, $3) RETURNING *', [username, email, hashedPassword]);

      return jwt.sign({
        username: insertedSuperUser.rows[0].username,
        email: insertedSuperUser.rows[0].email,
        id: insertedSuperUser.rows[0].id,
      }, process.env.SECRET_JWT_SUPERUSER_KEY, { expiresIn: '7d' }, async (err, token) => {
        if (err) {
          return res.status(403).send(err);
        }

        return res.status(201).json({
          user: insertedSuperUser.rows,
          message: 'user created successfully',
          token,
        });
      });
    } catch (error) {
      return httpResponse.error(res, 500, error.message, 'Internal server error');
    }
  }

  /**
    * @static
    *
    * @description login for users
    * @memberOf Authentication
    */

  static async login(req, res) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({
          message: 'all fields required',
          code: 400,
        });
      }

      const userExistQuery = 'SELECT * FROM superuser WHERE email=$1';
      const userExistValue = [email];
      const userExist = await pool.query(userExistQuery, userExistValue);
      if (userExist.rows[0]) {
        const match = await bcrypt.compare(
          password,
          userExist.rows[0].password,
        );

        if (match) {
          return jwt.sign({
            username: userExist.rows[0].username,
            email: userExist.rows[0].email,
            id: userExist.rows[0].id,
            profile_img: userExist.rows[0].profile_img,
            header_img: userExist.rows[0].header_img,
          }, process.env.SECRET_JWT_SUPERUSER_KEY, { expiresIn: '30d' }, async (err, token) => {
            if (err) {
              return res.status(403).send(err);
            }

            return httpResponse.auth_success(res, 200, 'login success', token, userExist.rows[0]);
          });
        }
        return httpResponse.error(res, 403, 'Incorrect email or password', true);
      }

      return httpResponse.error(res, 403, 'Email does not exist', true);
    } catch (error) {
      return httpResponse.error(res, 500, error.message, 'server error');
    }
  }

  /**
   *  @description   view a user profile
   *  @param { object }
   *
   *  @returns { object } - full details of user's profile
   * */

  static async disableGroup(req, res) {
    const { orgId: organizationId } = req.params;
    try {
      if (!organizationId) return httpResponse.error(res, 400, 'all fields required', true);

      const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);
      if (checkIfOrgExist.rows[0]) {
        const disableOrg = await pool.query('UPDATE organization SET is_disabled = $1 WHERE id=$2 RETURNING *', [!checkIfOrgExist.rows[0].isprivate, organizationId]);
        return httpResponse.success(res, 200, disableOrg.rows[0].is_disabled ? 'organization is disabled' : 'organization is enabled', disableOrg.rows[0]);
      }
      return httpResponse.error(res, 400, 'org does not exist', true);
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

  static async verifyOrg(req, res) {
    const { orgId: organizationId } = req.params;
    try {
      if (!organizationId) return httpResponse.error(res, 400, 'all fields required', true);

      const checkIfOrgExist = await pool.query('SELECT * FROM organization WHERE id=$1', [organizationId]);
      if (checkIfOrgExist.rows[0]) {
        const verifyOrg = await pool.query('UPDATE organization SET is_verified = $1 WHERE id=$2 RETURNING *', [!checkIfOrgExist.rows[0].is_verified, organizationId]);
        return httpResponse.success(res, 200, verifyOrg.rows[0].is_verified ? 'organization is verified' : 'organization is unverified', verifyOrg.rows[0]);
      }
      return httpResponse.error(res, 400, 'org does not exist', true);
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
  static async AppDetails(req, res) {
    try {
      const stats = await pool.query('SELECT COUNT(*) AS users_count, (SELECT COUNT(*) FROM organization) AS org_count, (SELECT COUNT(*) FROM post) AS post_count, (SELECT COUNT(*) FROM comment) AS comment_count, (SELECT COUNT(*) FROM organizationMembers WHERE has_joined=true) AS org_members_count FROM users');
      return httpResponse.success(res, 200, 'Analytics', stats.rows);
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view all organization
   *  @param { object }
   *
   *  @returns { object } - org created
   * */

  static async FetchAllOrgs(req, res) {
    const start = req.query.start || 0;
    const count = req.query.count || 10;

    try {
      const selectOrgQuery = 'SELECT *, (SELECT COUNT(*) FROM organizationMembers orgMembers WHERE org.id = orgMembers.organization_id) AS members_count FROM organization org ORDER BY org.createdat OFFSET($1) LIMIT($2)';
      const allOrg = await pool.query(selectOrgQuery, [start, count]);
      if (allOrg.rows[0]) {
        return httpResponse.success(res, 200, 'all organizations', allOrg.rows);
      }
      return httpResponse.success(res, 200, 'no organization found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }

  /**
   *  @description   view all users
   *  @param { object }
   *
   *  @returns { object } - org created
   * */

  static async FetchAllUsers(req, res) {
    const start = req.query.start || 0;
    const count = req.query.count || 10;

    try {
      const selectOrgQuery = 'SELECT *, (SELECT COUNT(*) FROM organizationMembers orgMembers WHERE u.id = orgMembers.user_id) AS org_count FROM users u ORDER BY u.createdat DESC OFFSET($1) LIMIT($2)';
      const allUsers = await pool.query(selectOrgQuery, [start, count]);
      if (allUsers.rows[0]) {
        return httpResponse.success(res, 200, 'all users', allUsers.rows);
      }
      return httpResponse.success(res, 200, 'no user found');
    } catch (error) {
      return res.status(500).json({
        message: ` Error from server ${error}`,
      });
    }
  }
}

export default SuperUser;
