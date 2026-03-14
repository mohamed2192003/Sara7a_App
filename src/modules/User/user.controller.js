import { Router } from "express";
import { deleteUser, getUserData, getUserProfile, shareProfileLink, updateUser } from "./user.service.js";
import { auth } from "../../common/middleware/auth.js";
import { SuccessResponse } from "../../common/index.js";
import { multerLocal } from "../../common/middleware/multer.middleware.js";
const router = Router()
router.get('/get-user-profile', auth,  async(req, res)=>{
    let data = await getUserProfile(req.userId)
    return SuccessResponse({res, message:'User Profile Found Successfully', status:200, data})
})
router.get('/get-url-profile', auth, async(req, res)=>{
    let data = await shareProfileLink(req.userId)
    return SuccessResponse({res, message:'User Profile Link Generated Successfully', status:200, data})
})
router.get('/get-user-data', async(req, res)=>{  //we made this api to get user data by share profile name which is public and can be accessed by anyone without authentication
    let data = await getUserData(req.body)
    return SuccessResponse({res, message:'User Data Found Successfully', status:200, data})
})
router.patch('/update-user',auth, multerLocal ().single('image'), async(req, res)=>{
    let data = await updateUser(req.userId, req.body, req.file)
    console.log(req.userId, "from user controller");
    
    return SuccessResponse({res, message:'User Updated Successfully', status:200, data})
})
router.delete('/delete-user', async(req, res)=>{
    let data = await deleteUser(req.userId)
    return SuccessResponse({res, message:'User Deleted Successfully', status:200, data:data})
})
export default router