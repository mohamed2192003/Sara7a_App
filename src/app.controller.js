import express from 'express';
import { env } from './../config/env.service.js'
import { databaseConnection } from './database/index.js';
import { globalErrorHandler } from './common/index.js'
import authRouter from './modules/Auth/auth.controller.js'

export const bootstrap = async()=>{
    const app = express()
    app.use(express.json())
    app.use('/auth', authRouter)
    app.use('/uploads', express.static('uploads'));
    await databaseConnection()
    app.use('{*dummy}', (req, res)=>{
        res.status(404).json('🚫 Invalid Route')   
    })
    app.use(globalErrorHandler) 
    app.listen(env.port, ()=>{
        console.log(`🚀 Server is Running on http://localhost:${env.port}, From app.controller.js`);
    } )
}