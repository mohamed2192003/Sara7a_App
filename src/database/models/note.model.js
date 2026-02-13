import mongoose from "mongoose";
const noteSchema = mongoose.Schema({
    content:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 350
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})
const noteModel = mongoose.model("Note", noteSchema);
export default noteModel;