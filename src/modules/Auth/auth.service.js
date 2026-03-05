import {
  BadRequestException,
  ConflictException,
  decodeRefreshToken,
  generateToken,
  NotFoundException,
  ProviderEnums,
  UnauthorizedException,
} from "../../common/index.js";
import { userModel } from "../../database/index.js";
import {
  findById,
  findByIdAndDelete,
  findByIdAndUpdate,
  findOne,
} from "../../database/database.service.js";
import { env } from "./../../../config/index.js";
import { compareHash, generateHash } from "../../common/index.js";
import jwt from "jsonwebtoken";
import { access } from "fs";
export const signup = async (data) => {
  let { userName, email, password } = data;
  let existUser = await userModel.findOne({ email });
  if (existUser) {
    return ConflictException({ message: "User Already Exist" });
  }
  let hashedPassword = await generateHash(password);
  let addedUser = await userModel.create({
    userName,
    email,
    password: hashedPassword,
  });
  return addedUser;
};
export const login = async (data, issuer) => {
  let { email, password } = data;
  const existUser = await findOne({
    model: userModel,
    filter: { email, provider: ProviderEnums.System }
  });
  if (!existUser) {
    return NotFoundException({ message: "User Not Found" });
  }else{
    let { accessToken, refreshToken } = await generateToken(existUser)
    const isMatched = await compareHash(password, existUser.password);
    if (isMatched) {
      return { existUser, accessToken, refreshToken };
    }
  }
};
export const getUserById = async (userId) => {
  let userData = await findById({
    model: userModel,
    id: userId,
  });
  return userData;
};
export const generateAccessToken = async(token)=>{
  let decodedData = await decodeRefreshToken(token)
  let signature = undefined
      switch (decodedData.aud) {
        case "admin":
            signature = env.adminSignature
            break;
        default:
            case "user":
            signature = env.userSignature
            break;
    }
    let accessToken = jwt.sign({ id: decodedData.id }, signature, { audience: decodedData.aud, expiresIn: '30m' })
    return accessToken
}
export const signupGoogle = async(data)=>{
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: data.token,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  if(!payload.email_verified){
    BadRequestException({ message: "Email Not Verified" })
  }
  let existUser = await findOne({
    model: userModel,
    filter: { email: payload.email, provider: ProviderEnums.Google }
  });
  if (existUser) {
    return ConflictException({ message: "User Already Exist" });
  }else{
    let addedUser = await userModel.create({
      userName: payload.name,
      email: payload.email,
      provider: ProviderEnums.Google,
    });
    if(addedUser){
    return addedUser;
  }else{
    throw BadRequestException({ message: "Error Creating User" })
  }
}
}
export const updateUser = async (headers, data) => {
  if (!headers.authorization) {
    return UnauthorizedException("Unauthorized");
  }
  const decode = jwt.verify(headers.authorization, env.jwtKey);
  const userData = await findByIdAndUpdate({
    model: userModel,
    id: decode.id,
    data,
  });
  if (!userData) {
    return NotFoundException({ message: "User Not Found" });
  }
  return userData;
};
export const deleteUser = async (headers) => {
  if (!headers.authorization) {
    return UnauthorizedException("Unauthorized");
  }
  const decode = jwt.verify(headers.authorization, env.jwtKey);
  const userData = await findByIdAndDelete({ model: userModel, id: decode.id });
  if (!userData) {
    return NotFoundException({ message: "User Not Found" });
  }
  return { message: "User Deleted Successfully" };
};