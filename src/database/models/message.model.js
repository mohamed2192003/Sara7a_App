import mongoose from "mongoose";
const messageSchema = mongoose.Schema({
    message:{
        type: String,
        required: true,
        minLength: 10,
        maxLength: 500
    },
    recieverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image:{
        type:String
    }
},
{timestamps: true}
)
const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;