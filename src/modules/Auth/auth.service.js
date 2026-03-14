import {
  BadRequestException,
  ConflictException,
  decodeRefreshToken,
  generateToken,
  NotFoundException,
  ProviderEnums,
} from "../../common/index.js";
import { userModel, set, createRevokeKey, del } from "../../database/index.js";
import {
  findById,
  findOne,
  findOneAndUpdate
} from "../../database/database.service.js";
import { env } from "./../../../config/index.js";
import { compareHash, generateHash } from "../../common/index.js";
import jwt from "jsonwebtoken";
import { get } from './../../database/index.js';
import { event } from "../../common/utils/email/email.events.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
export const  signup = async (data, file) => {
  let { userName, email, password, shareProfileName } = data;
  let existUser = await userModel.findOne({ email });
  if (existUser) {
    throw ConflictException({ message: "User Already Exist" });
  }
  let image = ''
  if(file){
    image = `${env.baseURL}/uploads/${file.filename}`
  }
  let hashedPassword = await generateHash(password);
  let addedUser = await userModel.create({
    userName,
    email,
    password: hashedPassword,
    shareProfileName,
    imgProfileURL: image});
   event.emit("verifyEmail", {userId: addedUser._id, email})
  return addedUser;
};
export const verifyEmail = async ({ code, email } = {}) => {
  if (!code || !email) {
    throw BadRequestException({ message: "Code and email are required" })
  }
  const user = await findOne({
    model: userModel,
    filter: { email }
  })
  if (!user) {
    throw NotFoundException({ message: "User Not Found" })
  }
  if (user.isVerified) {
    throw BadRequestException({ message: "Email Already Verified" })
  }
  const redisKey = `otp:signup:${user._id}`
  const redisCode = await get(redisKey)
  if (!redisCode) {
    throw BadRequestException({ message: "OTP Expired" })
  }
  const isMatch = await compareHash(code, redisCode)
  if (!isMatch) {
    throw BadRequestException({ message: "Invalid OTP" })
  }
  const updatedUser = await userModel.findByIdAndUpdate(
    user._id,
    { $set: { isVerified: true } },
    { new: true }
  )
  await del(redisKey)
  return updatedUser
}
export const login = async (data, issuer) => {
  const { email, password } = data
  const existUser = await findOne({
    model: userModel,
    filter: { email, provider: ProviderEnums.System }
  })
  if (!existUser) {
    throw NotFoundException({ message: "User Not Found" })
  }
  if (existUser.lockUntil && existUser.lockUntil > Date.now()) {
    throw BadRequestException({
      message: "Account locked. Try again later."
    })
  }
  const isMatch = await compareHash(password, existUser.password)
  if (!isMatch) {
    existUser.loginAttempts += 1
    if (existUser.loginAttempts >= 5) {
      existUser.lockUntil = Date.now() + 5 * 60 * 1000
      existUser.loginAttempts = 0
    }
    await existUser.save()
    throw BadRequestException({ message: "Invalid credentials" })
  }
  existUser.loginAttempts = 0
  existUser.lockUntil = null
  await existUser.save()
  if (existUser.twoFactorEnabled) {
    const otp = Math.floor(Math.random()*10000).toString().padStart(4, '0')
    const hashOTP = await generateHash(otp)
    await set(`otp:login:${existUser._id}`, hashOTP, { EX: 300 })
    await sendEmail({
      to: existUser.email,
      subject: "Your Login OTP",
      html: `<p>Your OTP for login is: <b>${otp}</b>. It is valid for 5 minutes.</p>`
    })
    return {
      step: "2fa",
      userId: existUser._id
    }
  }
  const { accessToken, refreshToken } = await generateToken(existUser, issuer)
  return {
    user: existUser,
    accessToken,
    refreshToken
  }
}
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
    throw BadRequestException({ message: "Email Not Verified" })
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
export const logout = async (req) => {
  const redisKey = createRevokeKey({
    userId: req.userId,
    token: req.token
  })
  await set({
    key: redisKey,
    value: 1,
    ttl: 30*60
})
}
export const forgetPassword = async (data) => {
  let { email } = data;
  let OTPMessage;
  let existUser = await findOne({ model: userModel, filter: { email } });
  if (!existUser) {
    throw BadRequestException({ message: 'User Not Found' });
  } else {
    let code = Math.ceil(Math.random() * 10000);
    code = code.toString().padStart(4, '0');
    await set({
      key: `otp::${existUser._id}`,
      value: await generateHash(code),
      ttl: 5 * 60
    });
    await sendEmail({
      to: existUser.email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${code}</b>. It is valid for 5 minutes.</p>`
    });
    OTPMessage = code;
  }
  return OTPMessage;
}
export const resetPassword = async (data) => {
  const { email, otp, password } = data
  const existUser = await findOne({
    model: userModel,
    filter: { email }
  })
  if (!existUser) {
    throw BadRequestException({ message: "User Not Found" })
  }
  const hashOTP = await get(`otp::${existUser._id}`)
  if (!hashOTP) {
    throw BadRequestException({ message: "OTP expired" })
  }
  const isMatch = await compareHash(otp, hashOTP)
  if (!isMatch) {
    throw BadRequestException({ message: "Invalid OTP" })
  }
  if (await compareHash(password, existUser.password)) {
    throw BadRequestException({
      message: "Password can't be the same as the old one"
    })
  }
  const hashedPassword = await generateHash(password)
  const updatedUser = await findOneAndUpdate({
    model: userModel,
    filter: { email },
    update: { password: hashedPassword },
    options: { new: true }
  })
  await del(`otp::${existUser._id}`)
  return updatedUser
}
export const enableTwoFactorAuth = async (userId) => {
  const user = await findById({ model: userModel, id: userId })
  if (!user) {
    throw NotFoundException({ message: "User Not Found" })
  }
  if (user.twoFactorEnabled) {
    throw BadRequestException({
      message: "Two-factor authentication already enabled"
    })
  }
  const otp = Math.floor(Math.random()*10000)
    .toString()
    .padStart(4,'0')
  const hashOTP = await generateHash(otp)
  await set({
    key: `otp:2fa:${userId}`,
    value: hashOTP,
    ttl: 5 * 60
  })
  await sendEmail({
    to: user.email,
    subject: "Enable Two Factor Authentication",
    html: `<p>Your OTP is <b>${otp}</b></p>`
  })
  return { message: "OTP sent to your email" }
}
export const confirmTwoFactorAuth = async ({ userId, code }) => {
  const user = await findOne({ model: userModel, id: userId })
  if (!user) {
    throw NotFoundException({ message: "User Not Found" })
  }
  const redisCode = await get(`otp:2fa:${userId}`)
  if (!redisCode) {
    throw BadRequestException({ message: "OTP expired" })
  }
  const isMatch = await compareHash(code, redisCode)
  if (!isMatch) {
    throw BadRequestException({ message: "Invalid OTP" })
  }
  const updatedUser = await findOneAndUpdate({
    model: userModel,
    filter: { _id: userId },
    update: { twoFactorEnabled: true },
    options: { new: true }
  })
  await del(`otp:2fa:${userId}`)
  return updatedUser
}