import { BadRequestException, NotFoundException, UnauthorizedException } from "../../common/index.js"
import { findOne, findOneAndDelete, findOneAndUpdate, get, set, userModel } from "../../database/index.js"
import { env } from "../../../config/index.js"
let redisKey = (userId) => `userProfile::${userId}`
export const getUserProfile = async(userId)=>{
    let userData = await get(redisKey(userId))
    if(userData){
        return userData
    }
    userData = await findOne({
        model: userModel,
        filter: { id: userId },
        select: '-shareProfileName'
    })
    if(!userData){
        throw BadRequestException({message: 'User Not Found'})
    }else{
        await set({
            key: redisKey,
            value: userData,
            ttl: 60
        })
    }
    return userData
}
export const shareProfileLink = async(userId)=>{
        let userData = await findOne({
        model: userModel,
        filter: { id: userId }
    })
    if(!userData){
        throw BadRequestException({message: 'User Not Found'})
    }
    let uri = `${env.baseURL}/profile/${userData.shareProfileName}`    
    return uri;
}
export const getUserData = async(data)=>{
    let {shareProfileName} = data
    let userLink = shareProfileName.split('/')[4]
    let userData = await findOne({
        model: userModel,
        filter: { shareProfileName: userLink },
        select: 'firstName lastName email imgProfileURL'
    })
    if(userData){
        return userData
    }else{
        throw BadRequestException({message: 'User Not Found'})
    }   
}
export const updateUser = async (userId, data, file) => {
    const existUser = await findOne({
        model: userModel,
        filter: { id: userId }
    })
    set({
        key: redisKey(userId),
        value:  '',
        ttl: 0
    })
    if (!existUser) {
        throw BadRequestException({ message: 'User not found' })
    }
    if (file) {
        data.imageProfileURL = `${env.baseURL}/uploads/${file.filename}`
    }
    const updatedUser = await findOneAndUpdate({
        model: userModel,
        filter: { id: userId },
        data,
        options: { new: true }
    })
    if (!updatedUser) {
        throw BadRequestException({ message: 'Failed to Update User' })
    }
    return updatedUser
}
export const deleteUser = async (userId) => {
  const userData = await findOneAndDelete({ model: userModel, filter: { id: userId } });
  if (!userData) {
    return NotFoundException({ message: "User Not Found" });
  }
  return { message: "User Deleted Successfully" };
};