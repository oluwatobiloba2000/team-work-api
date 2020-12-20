/* eslint-disable consistent-return */
import jwt from 'jsonwebtoken';
import httpResponse from '../helpers/http-response';

const checkSuperUserToken = (req, res, next) => {
  const header = req.headers.authorization;
  try {
    if (typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1] || req.token;
      const decodedToken = jwt.verify(token, process.env.SECRET_JWT_SUPERUSER_KEY);
      if (decodedToken) {
        req.user = decodedToken;
        req.token = token;
        return next();
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

export default checkSuperUserToken;
