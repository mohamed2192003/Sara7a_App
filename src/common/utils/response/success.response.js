








export const SuccessResponse = ({res, message = 'done', status = 200, data = undefined} = {})=>{
    return res.status(status).json({status, message, data})
}

// SuccessResponse({res:res, message:'mohamed', status:200, data:{name:'mahmoud', email:'mohamed@gmail.com'}})