import nodemailer from 'nodemailer';
import { env } from '../../../../config/index.js';
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,    //use true for port 465 
  auth: {
    user: env.emailSender,  //sender email address
    pass: env.emailPass
  },
    tls: {
    rejectUnauthorized: false //allow self-signed certificates
  }
})
export const sendEmail = async({ to, subject, html })=>{
    const info = await transporter.sendMail({
        from: `"${env.emailSender}" <${env.emailSender}>`,       //sender email address
        to,                 //recipient email address      
        subject,
        html
    })
    console.log('Message sent: %s', info.messageId);
}