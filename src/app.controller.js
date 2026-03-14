import express from 'express';
import { env } from './../config/env.service.js'
import { databaseConnection, connectRedis } from './database/index.js';
import { globalErrorHandler } from './common/index.js'
import authRouter from './modules/Auth/auth.controller.js'
import messageRouter from './modules/Messages/message.controller.js'
import userRouter from './modules/User/user.controller.js'
import cors from 'cors'
export const bootstrap = async()=>{
    const app = express()
    app.use(express.json())
    app.use(cors())
    app.use('/auth', authRouter)
    app.use('/messages', messageRouter)
    app.use('/users', userRouter)
    app.use('/uploads', express.static('uploads'));
    await databaseConnection()
    await connectRedis()
    app.use('{*dummy}', (req, res)=>{
        res.status(404).json('🚫 Invalid Route')   })
    app.use(globalErrorHandler) 
    app.listen(env.port, ()=>{
        console.log(`🚀 Server is Running on http://localhost:${env.port}`);
    })
}