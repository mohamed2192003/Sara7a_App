import mongoose from "mongoose";
import {env} from './../../config/index.js'
export const databaseConnection = async()=>{
        await mongoose.connect(env.mongoURL).then(()=>{
            console.log("✅ Database Connected Successfully");
        }).catch((err)=>{
            console.log(err, "from connection.js"); 
        })
}