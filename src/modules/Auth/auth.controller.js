import { Router } from "express";
import { deleteUser, generateAccessToken, getUserById, login, signup, signupGoogle, updateUser } from "./auth.service.js";
import { SuccessResponse } from "../../common/index.js";
import { upload } from "../../common/middleware/multer.middleware.js";
import { auth } from "../../common/middleware/auth.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { validation } from "../../common/utils/validation.js";
const router = Router() 
router.post('/signup', validation(signupSchema), async(req, res)=>{
     let addedUser = await signup(req.body)
    return SuccessResponse({res, message:'User Added Successfully', status:201, data:addedUser})
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
router.patch('/update-user', async(req, res)=>{
    let userData = await updateUser(req.headers, req.body)
    return SuccessResponse({res, message:'User Updated Successfully', status:200, data:userData})
})
router.delete('/delete-user', async(req, res)=>{
    let userData = await deleteUser(req.headers)
    return SuccessResponse({res, message:'User Deleted Successfully', status:200, data:userData})
})
router.patch('/upload-profile-img', upload.single('profileImage'), async (req, res) => {
    if (req.file) {
      req.body.imgProfileURL = `/uploads/users/${req.file.filename}`;
    }
    let userData = await updateUser(req.headers, req.body);
    return SuccessResponse({ res, message: 'User Updated Successfully', status: 200, data: userData });
});
router.get('/profile-picture', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const decode = jwt.verify(req.headers.authorization, env.jwt)
    const user = await findById({
        model: userModel,
        id: decode.id
    })
    if (!user || !user.imgProfileURL) {
        return res.status(404).json({ message: "No Profile Picture" })
    }
    return res.sendFile(path.resolve(user.imgProfileURL))
})
export default router