import { ConflictException, NotFoundException, ProviderEnums, UnauthorizedException } from "../../common/index.js";
import { userModel } from "../../database/index.js";
import { findById, findByIdAndDelete, findByIdAndUpdate, findOne } from "../../database/database.service.js";
import jwt from 'jsonwebtoken'
import { env } from './../../../config/index.js'
import { compareHash, generateHash } from "../../common/index.js";
export const signup = async(data)=>{
    let {userName, email, password} = data
    let existUser = await userModel.findOne({ email})
    if(existUser){
        return ConflictException({message: 'User Already Exist'})
    }
    let hashedPassword = await generateHash(password)
    let addedUser = await userModel.create({userName, email, password:hashedPassword})
    return addedUser
}
export const login = async (data) => {
    let { email, password } = data
     const existUser = await findOne({model: userModel, filter: { email, provider: ProviderEnums.System }, select:"-provider"})
    if (!existUser) {
        return NotFoundException({ message: 'User Not Found' })
    }
    const isMatched = await compareHash(password, existUser.password)
    if (isMatched) {
        const token = jwt.sign(
            { id: existUser._id }, env.jwt)
        return { existUser, token } 
    }
}
export const getUserById = async(headers) =>{
    if(!headers.authorization){
        return UnauthorizedException("Unauthorized")
    }
    let decode =await jwt.verify(headers.authorization, env.jwt)
    let userData = await findById({model: userModel, id: decode.id, select: '-password'})
    return userData
}
export const updateUser = async (headers, data) => {
    if (!headers.authorization) {
        return UnauthorizedException("Unauthorized")
    }
    const decode = jwt.verify(headers.authorization, env.jwt)
    const userData = await findByIdAndUpdate({ model: userModel, id: decode.id, data })
    if (!userData) {
        return NotFoundException({ message: "User Not Found" })
    }
    return userData
}
export const deleteUser = async (headers) => {
    if (!headers.authorization) {
        return UnauthorizedException("Unauthorized")
    }
    const decode = jwt.verify(headers.authorization, env.jwt)
    const userData = await findByIdAndDelete({ model: userModel, id: decode.id })
    if (!userData) {
        return NotFoundException({ message: "User Not Found" })
    }
    return { message: "User Deleted Successfully" }
}