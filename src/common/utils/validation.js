import { BadRequestException } from "./../index.js";
export const validation = (schema) => {
  return (req, res, next) => {
    let { value, error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false => to get all the errors not just the first one
    if (error) {
      throw BadRequestException({
        message: "Validation Error",
        extra: error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    req.body = value
    next();
  };
};