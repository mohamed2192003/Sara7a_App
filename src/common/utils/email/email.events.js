import { EventEmitter } from "events";
import { set } from "../../../database/index.js";
import { sendEmail } from "./sendEmail.js";
import { generateHash } from "../../index.js";
export let event = new EventEmitter()
event.on("verifyEmail", async (data) => {
  const { userId, email } = data
  let code = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  const redisKey = `otp:signup:${userId}`
  await set({
    key: redisKey,
    value: await generateHash(code),
    ttl: 5 * 60
  })
  await sendEmail({
    to: email,
    subject: "Verification Code",
    html: `
      <h1>Thank you for signing up</h1>
      <p>Please verify your email address by the OTP below:</p>
      <h2>${code}</h2>
      <p>This OTP is valid for 5 minutes.</p>
    `
  })
})