/* eslint-disable max-len */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db/index';
import httpResponse from '../helpers/http-response';
import validate from '../middleware/auth.validation';

/**
 * @class Authentication
 *
 * @description  Authentication for users
 */

class Authentication {
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
      firstname,
      lastname,
      email,
      address,
      gender,
    } = req.body;

    try {
      if (!username || !password || !firstname || !lastname || !email || !address || !gender) {
        return res.status(400).json({
          message: 'all fields required',
          code: 400,
        });
      }

      const validationError = validate.signup(username, password, firstname, lastname, email);
      if (validationError.message) {
        return res.status(400).json({
          status: 'validation error',
          code: 400,
          message: validationError.message,
        });
      }

      const usernameExist = await db.query('SELECT * FROM users WHERE username=$1', [username]);
      if (usernameExist.rows[0]) {
        return res.status(400).json({
          message: 'username already taken',
          code: 400,
        });
      }

      const userEmailExist = await db.query('SELECT * FROM users WHERE email=$1', [email]);
      if (userEmailExist.rows[0] && userEmailExist.rows[0].has_joined) {
        return res.status(400).json({
          message: 'email already taken',
          code: 400,
        });
      }

      //  hash the incoming password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertedUser = await db.query('INSERT INTO users (username,firstname, lastname,email, password, has_joined, date_joined, gender, address) VALUES($1, $2, $3, $4, $5, $6, NOW(), $7, $8) RETURNING *', [username, firstname, lastname, email, hashedPassword, true, gender, address]);

      return jwt.sign({
        username: insertedUser.rows[0].username,
        email: insertedUser.rows[0].email,
        id: insertedUser.rows[0].id,
      }, process.env.SECRET_JWT_KET, { expiresIn: '7d' }, async (err, token) => {
        if (err) {
          return res.status(403).send(err);
        }

        const org = await db.query('SELECT * FROM organizationMembers WHERE email=$1', [email]);

        return res.status(201).json({
          user: insertedUser.rows,
          message: 'user created successfully',
          token,
          org: org.rows[0] || 'no org found',
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

      const validationError = validate.login(email, password);
      if (validationError.message) {
        return res.status(400).json({
          status: 'validation error',
          code: 400,
          message: validationError.message,
        });
      }

      const userExistQuery = 'SELECT * FROM users WHERE email=$1';
      const userExistValue = [email];
      const userExist = await db.query(userExistQuery, userExistValue);
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
          }, process.env.SECRET_JWT_KET, { expiresIn: '30d' }, async (err, token) => {
            if (err) {
              return res.status(403).send(err);
            }

            // fetch all organizations the user belongs to
            const userOrgQuery = 'SELECT * FROM organizationMembers WHERE user_id=$1 ORDER BY createdat';
            const userOrgValue = [userExist.rows[0].id];
            const userOrg = await db.query(userOrgQuery, userOrgValue);
            return httpResponse.auth_success(res, 200, 'login success', token, userExist.rows[0], userOrg.rows.length !== 0 ? userOrg.rows : 'no org found');
          });
        }
        return httpResponse.error(res, 403, 'Incorrect email or password', true);
      }

      return httpResponse.error(res, 403, 'Email does not exist', true);
    } catch (error) {
      return httpResponse.error(res, 500, error.message, 'server error');
    }
  }
}

export default Authentication;
