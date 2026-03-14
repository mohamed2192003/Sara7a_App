import { Router } from "express";
import { generateAccessToken, getUserById, login, logout, signup, signupGoogle, forgetPassword, resetPassword, verifyEmail, enableTwoFactorAuth, confirmTwoFactorAuth } from "./auth.service.js";
import {  BadRequestException, SuccessResponse } from "../../common/index.js";
import { auth } from "../../common/middleware/auth.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { validation } from "../../common/utils/validation.js";
import { multerLocal } from "../../common/middleware/multer.middleware.js";
const router = Router() 
router.post('/signup', multerLocal({customePath: "profile-pictures"}).single('image'),validation(signupSchema), async(req, res)=>{
    let addedUser = await signup(req.body, req.file)
    return SuccessResponse({res, message:'User Added Successfully', status:201, data:addedUser})
})
router.post('/verify-email', async(req, res)=>{
    let data = await verifyEmail(req.body)
    if(data){
        return SuccessResponse({res, message:'Email Verified Successfully', status:200})
    }else{
        return BadRequestException({ message: "Invalid OTP" })
    }
})
router.post('/login', validation(loginSchema), async(req, res)=>{
    let userData = await login(req.body, `${req.protocol}://${req.host}`)
    return SuccessResponse({res, message:'User Logged in Successfully', status:200, data:userData})
})
router.get('/get-user-by-id', auth, async(req, res) =>{
    let userData = await getUserById(req.userId)
    return SuccessResponse({res, message:'User Found Successfully', status:200, data:userData})
})
router.get('/generate-access-token', async(req, res)=>{
    let {authorization} = req.headers
    let accessToken = await generateAccessToken(authorization)
    return SuccessResponse({res, message:'Access Token Generated Successfully', status:200, data: accessToken}) 
})
router.post('/signup/gmail', async(req, res)=>{
    const data = await signupGoogle(req.body)
    return SuccessResponse({res, message:'User Signed Up Successfully', status:201, data}) 
})
router.post('/profile-picture', multerLocal({customePath: "profile-pictures"}).single('image'), async(req, res)=>{
    req.file.finalPath = `${req.file.destination}/${req.file.filename}`
    res.status(200).json({
        message: "File uploaded successfully",
        file: req.file,
        body: req.body 
    })
})
router.post('/forget-password', async(req, res)=>{
    let data = await forgetPassword(req.body)
    return SuccessResponse({res, message: 'OTP Sent On Email', status: 200})
})
router.post('/reset-password', async(req, res)=>{
    let data = await resetPassword(req.body)
    return SuccessResponse({res, message: 'Password Reseted Successfully', status: 200, data})
})
router.post('/logout', auth, async(req, res)=>{
    await logout(req)
    return SuccessResponse({res, message:'User Logged Out Successfully', status:200})
})
router.post('/enable-2fa', auth, async(req, res)=>{
    let data = await enableTwoFactorAuth(req.userId)
    return SuccessResponse({res, message:'Two Factor Authentication Enabled Successfully', status:200, data})
})
router.post('/confirm-2fa', auth, async(req, res)=>{
let data = await confirmTwoFactorAuth({
  userId: req.userId,
  code: req.body.code
})
    return SuccessResponse({res, message:'Two Factor Authentication Confirmed Successfully', status:200, data})
})
export default router