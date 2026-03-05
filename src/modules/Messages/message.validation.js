import joi from "joi";
export const sendMessageSchema = joi.object({
    message: joi.string().required().min(10).max(500).messages({
        'string.base': 'Message should be a type of text',
        'string.empty': 'Message cannot be empty',
        'string.min': 'Message should have a minimum length of 10 characters',
        'string.max': 'Message should have a maximum length of 500 characters',
        'any.required': 'Message is required'
        }),
    image: joi.string().uri().messages({
        'string.base': 'Image should be a type of text',
        'string.uri': 'Image should be a valid URI'
    })
})