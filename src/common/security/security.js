import { env } from './../../../config/index.js';
import jwt from 'jsonwebtoken'
export const generateToken = (user)=>{
    let signature = undefined
    let audience = undefined
    let refreshSignature = undefined
    switch(user.role){
        case '0':
            signature = env.adminSignature
            refreshSignature = env.adminRefreshSignature
            audience = 'admin'
            break;
        default:
                signature = env.userSignature
                refreshSignature = env.userRefreshSignature
                audience = 'user'
                break;
    }
    let accessToken = jwt.sign({id: user._id}, signature, {audience, expiresIn: '30m'})
    let refreshToken = jwt.sign({id: user._id}, refreshSignature, {audience, expiresIn: '1y'})
    return { accessToken, refreshToken }
}   
export const decodeToken= (token)=>{
    let signature = undefined 
    let decoded = jwt.decode(token)
    switch (decoded.aud) {
        case "admin":
            signature = env.adminSignature
            break;
        default:
            case "user":
            signature = env.userSignature
            break;
    }
    let decodedData = jwt.verify(token, signature)
    return decodedData
}
export const decodeRefreshToken= (token)=>{
    let decoded = jwt.decode(token)
    let refreshSignature = undefined 
    switch (decoded.aud) {
        case "admin":
            refreshSignature = env.adminRefreshSignature
            break;
        default:
            case "user":
            refreshSignature = env.userRefreshSignature
            break;
    }
    let decodedData = jwt.verify(token, refreshSignature)
    return decodedData
}
export const refreshAccessToken = ()=>{

}