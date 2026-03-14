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
export const decodeToken = (token) => {
    if (!token) {
        throw new Error("Token required")
    }
    const decoded = jwt.decode(token)
    if (!decoded) {
        throw new Error("Invalid token")
    }
    let signature
    switch (decoded.aud) {
        case "admin":
            signature = env.adminSignature
            break
        case "user":
        default:
            signature = env.userSignature
            break
    }
    const decodedData = jwt.verify(token, signature)
    return decodedData
}
export const decodeRefreshToken = (token) => {
    if (!token) {
        throw new Error("Token required")
    }
    const decoded = jwt.decode(token)
    if (!decoded) {
        throw new Error("Invalid refresh token")
    }
    let refreshSignature
    switch (decoded.aud) {
        case "admin":
            refreshSignature = env.adminRefreshSignature
            break
        case "user":
        default:
            refreshSignature = env.userRefreshSignature
            break
    }
    return jwt.verify(token, refreshSignature)
}
// export const refreshAccessToken = ()=>{

// }