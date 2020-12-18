const response = {
  error: (res, statusCode, errorMessage, error) => res.status(statusCode)
    .json({
      code: statusCode,
      message: errorMessage,
      error,
    }),
  success: (res, statusCode, message, data) => res.status(statusCode)
    .json({
      code: statusCode,
      message,
      data,
    }),
  auth_success: (res, statusCode, message, token, user, org) => res.status(statusCode)
    .json({
      code: statusCode,
      message,
      token,
      user,
      org,
    }),
};

export default response;
