import mongoose from "mongoose";
import { GenderEnums, ProviderEnums, RolesEnums } from "../../common/index.js";
const userSchema = new mongoose.Schema({
  firstName:{
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20
  },
  lastName:{
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true,
    minLength: 8
  },
  phone:String,
  dateOfBirth:Date,
  gender:{
    type:String,
    enum:Object.values(GenderEnums),
    default:GenderEnums.Male
  },
  provider:{
    type:String,
    enum:Object.values(ProviderEnums),
    default:ProviderEnums.System
  },
  shareProfileName:{
    type:String,
    required:true,
    unique:true
  },
  role:{
    type:String,
    enum:Object.values(RolesEnums),
    default:RolesEnums.User
  },
  imgProfileURL:String,
  isVerified:{
    type:Boolean,
    default:false
  },
  loginAttempts:{
    type:Number,
    default:0
  },
  lockUntil:Date,
  twoFactorEnabled:{
    type:Boolean,
    default:false
  },
  verificationExpires:{
    type:Date,
    default:()=>Date.now()+24*60*60*1000,
    index:{expires:0}
  }
},{
  timestamps:true,
  toJSON:{virtuals:true}
})
userSchema.virtual('userName')
.set(function(value){
  const [firstName,lastName] = value.split(' ')
  this.firstName = firstName
  this.lastName = lastName
})
.get(function(){
  return `${this.firstName} ${this.lastName}`
})
export const userModel = mongoose.model('User',userSchema)