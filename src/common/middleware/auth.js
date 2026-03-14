import { UnauthorizedException } from "../../common/index.js";
import { decodeToken } from "../../common/index.js";
import { get } from "../../database/index.js";
export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      throw UnauthorizedException("Unauthorized")
    }
    const [flag, token] = authorization.split(" ")
    switch (flag) {
      case "Basic": {
        const Basicdata = Buffer.from(token, "base64").toString()
        const [email, password] = Basicdata.split(":")
        console.log(email, password)
        break
      }
      case "Bearer": {
        const data = decodeToken(token)
        console.log(data);
        let revokedToken = await get(`RevokeToken::${data.id}::${token}` )
        if (revokedToken !== null) {
          throw UnauthorizedException("Already Logged Out")
        }else{

        }
        req.userId = data.id
        req.token = token
        req.decoded = data
        break
      }
      default:
        throw UnauthorizedException("Invalid authorization type")
    }
    next()
  } catch (error) {
    next(error)
  }
}