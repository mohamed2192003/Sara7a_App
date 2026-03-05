import { BadRequestException } from "../../common/index.js";
import {
  findById,
  insertOne,
  findAll,
  userModel,
  findOne,
  findByIdAndDelete
} from "../../database/index.js";
import messageModel from "../../database/models/message.model.js";
export const sendMessage = async (body, userId) => {
  let { message, image } = body;
  let existedUser = await findById({
    model: userModel,
    id: userId,
  });
  if (!existedUser) {
    return BadRequestException({message: "User not found"});
  }
    let addedMessage = await insertOne({
      model: messageModel,
      data: {
        message,
        image,
        recieverId: userId,
      },
    });
    if (addedMessage) {
      return addedMessage;
    } else {
      throw BadRequestException({message: "Failed to send message"});
    }
};
export const getAllMessages = async(userId)=>{
      let existedUser = await findById({
    model: userModel,
    id: userId,
  });
  if (!existedUser) {
    return BadRequestException({message: "User not found"});
  }
  let loadedMessages = await findAll({
    model: messageModel,
    filter: { recieverId: userId }
  })
    if (!loadedMessages.length) {
        throw BadRequestException({message: "Failed to load messages"});
    } else {
        return loadedMessages;
    }
}
export const getMessageById = async(messageId, userId)=>{
    console.log(messageId, "messageId from service");
    console.log(userId, "userId from service");
    let message = await findOne({
        model: messageModel, filter: { 
        _id: messageId,
        recieverId: userId
        }
    })
    if(!message){
        throw BadRequestException({message: "Message not found"});
    }
    else{
        return message
    }
}
export const deleteMessage = async(messageId, userId)=>{
    let message = await findOne({
        model: messageModel, filter: {
        _id: messageId,
        recieverId: userId
        }
    })
    if(!message){
        throw BadRequestException({message: "Message not found"});
    }
    else{
        await findByIdAndDelete({model: messageModel, id: messageId})
        return {message: "Message deleted successfully"}
    }
}