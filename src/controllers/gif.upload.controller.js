import cloudinary from 'cloudinary';
import 'dotenv/config';

/** ******
 * @class Upload
 *
 * @description Picture Upload
 *
 ********** */

class UploadGif {
  /**
   *  @static
   *
   * @param {object} request - {file named image}
   *
   * @returns {object} - status, data, size
   *
   *
   * @description This method is used to upload a gif to cloudinary
   * @memberOf Upload
   * */

  static async upLoad(req, res) {
    const { gif } = req.files;

    if (!gif) {
      return res.status(400).json({ message: 'gif file needed' });
    }
    try {
      return cloudinary.v2.uploader
        .upload(gif.tempFilePath, { resourse_type: 'auto' })
        .then(async (result) => {
          if (!result) return res.status(400).json({ message: 'upload error' });
          // image response
          return res.status(200).json({
            status: 'Ok',
            data: result,
          });
        })
        .catch((e) => {
          res.status(500).json({
            message: e.message,
          });
        });
    } catch (err) {
      return res.status(500).json({
        message: ' Error from server',
      });
    }
  }
}

export default UploadGif;
