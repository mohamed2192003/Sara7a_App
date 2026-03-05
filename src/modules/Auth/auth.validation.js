import joi from "joi";
export const signupSchema = joi.object({
  userName: joi.string().min(3).max(50).required(),
  email: joi.string().email().required(),
  password: joi
    .string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*-+]).{8,}$/)
    .required(),
  gender: joi.string().optional(),
  age: joi.number().min(18).max(60).required().messages({
    "number.min": "age must be greater than or equal 18",
    "number.max": "age must be less than or equal 60",
  }),
  users: joi.array().items(
    joi.object({
      name: joi.string().min(3).max(50),
    }),
  ),
});
export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).max(50).alphanum().required(),
});