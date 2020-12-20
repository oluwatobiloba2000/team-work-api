/* eslint-disable max-len */
import Joi from 'joi';

const validate = {
  login: (email, password) => {
    const JoiSchema = Joi.object({
      email: Joi.string().email().min(3).required(),
      password: Joi.string().min(5).required(),
    });

    return JoiSchema.validate({ email, password });
  },

  signup: (username, password, firstname, lastname, email) => {
    const JoiSchema = Joi.object({
      username: Joi.string().min(3).required(),
      password: Joi.string().min(5).required(),
      firstname: Joi.string().min(3).required(),
      lastname: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
    });

    return JoiSchema.validate({
      username, password, firstname, lastname, email,
    });
  },
};

export default validate;
