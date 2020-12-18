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
}

export default ProfileController;
