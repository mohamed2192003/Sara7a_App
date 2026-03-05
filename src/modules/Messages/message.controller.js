import { Router } from "express";
import { deleteMessage, getAllMessages, getMessageById, sendMessage } from "./message.service.js";
import { SuccessResponse } from "../../common/index.js";
import { sendMessageSchema } from "./message.validation.js";
import { validation } from './../../common/utils/validation.js';
import { auth } from './../../common/middleware/auth.js';
const router = Router()
router.post('/send-message/:id', validation(sendMessageSchema),async(req, res)=>{
    const data = await sendMessage(req.body, req.params.id);
    return SuccessResponse({res, message:'Message sent Successfully', status:201, data })
})
router.get('/get-all-messages', auth,async(req, res)=>{    
    const data = await getAllMessages(req.user._id);
    return SuccessResponse({res, message:'Messages retrieved Successfully', status:200, data })
})
router.get('/get-message-by-id/:id', auth, async(req, res)=>{
    let data = await getMessageById(req.params.id, req.user.id);
    return SuccessResponse({res, message:'Message retrieved Successfully', status:200, data })

}),
router.delete('/delete-message/:id', auth, async(req, res)=>{
    let data = await deleteMessage(req.params.id, req.user.id);
    return SuccessResponse({res, message:'Message deleted Successfully', status:200, data })
})
export default router