import dotenv from 'dotenv'
dotenv.config({path:"./config/.env"})
const mongoURL = process.env.DB_CONNECTION_URL;
const mood = process.env.MOOD;
const port = process.env.PORT;
const salt = process.env.SALT;
const jwtKey = process.env.JWT_KEY
const adminSignature = process.env.JWT_ADMIN_SIGNATURE
const userSignature = process.env.JWT_USER_SIGNATURE
const adminRefreshSignature = process.env.JWT_ADMIN_REFRESH_SIGNATURE
const userRefreshSignature = process.env.JWT_USER_REFRESH_SIGNATURE
const baseURL = process.env.BASE_URL
const redisUrl = process.env.REDIS_URL
const emailPass = process.env.EMAIL_PASS
const emailSender = process.env.EMAIL_SENDER
export const env = { 
    mongoURL,
    mood, 
    port, 
    salt, 
    jwtKey, 
    adminSignature, 
    userSignature, 
    adminRefreshSignature, 
    userRefreshSignature, 
    baseURL, 
    redisUrl, 
    emailPass, 
    emailSender 
}