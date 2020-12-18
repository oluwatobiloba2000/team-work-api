/* eslint-disable consistent-return */
import jwt from 'jsonwebtoken';
import httpResponse from '../helpers/http-response';

const checkToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1] || req.token;
      const decodedToken = jwt.verify(token, process.env.SECRET_JWT_KET);
      if (decodedToken) {
        req.user = decodedToken;
        req.token = token;
        next();
      }
      return res.sendStatus(403).json({
        code: 403,
        message: 'Invalid token',
      });
    }
    // if header is undefined , return bad request
    return res.sendStatus(403).json({
      code: 403,
      message: 'Not Authorized',
    });
  } catch (error) {
    return httpResponse.error(res, 500, error.message, 'verification failed');
  }
};

export default checkToken;
