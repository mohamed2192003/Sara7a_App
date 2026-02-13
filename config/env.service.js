import dotenv from 'dotenv'
dotenv.config({path:"./config/.env"})
const mongoURL = process.env.DB_CONNECTION_URL;
const mood = process.env.MOOD;
const port = process.env.PORT;
const salt = process.env.SALT;
const jwt = process.env.JWT
export const env = {mongoURL, mood, port, salt, jwt}