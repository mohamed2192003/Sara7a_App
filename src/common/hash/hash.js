import { hash, compare } from "bcrypt";
import { env } from "../../../config/index.js";
export const generateHash = async (plainText) => {
  let hashedPassword = await hash(plainText, +env.salt);
  return hashedPassword;
};
export const compareHash = async (plainText, hash) => {
  const isMatched = await compare(plainText, hash);
  return isMatched;
};
