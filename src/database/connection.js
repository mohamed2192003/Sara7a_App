import mongoose from "mongoose";
import {env} from './../../config/index.js'
console.log('🔗',env.mongoURL , "from connection.js");
export const databaseConnection = async()=>{
        await mongoose.connect(env.mongoURL).then(()=>{
            console.log("✅ Database Connected, from connection.js");
        }).catch((err)=>{
            console.log(err, "from connection.js"); 
        })
}