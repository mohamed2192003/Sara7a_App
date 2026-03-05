import { UnauthorizedException } from "../../common/index.js";
import { decodeToken } from "../../common/index.js";
import { userModel } from "../../database/index.js";
export const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return UnauthorizedException({ message: "Unauthorized" });
  }
  const [flag, token] = authorization.split(" ");
  if (!flag || !token) {
    return UnauthorizedException({ message: "Invalid authorization format" });
  }
  switch (flag) {
    case "Bearer":
      const decodedData = await decodeToken(token);
      if (!decodedData?.id) {
        return UnauthorizedException({ message: "Invalid token" });
      }
      const user = await userModel.findById(decodedData.id);
      if (!user) {
        return UnauthorizedException({ message: "User not found" });
      }
      req.user = user;   // 🔥 أهم سطر
      next();
      break;
    default:
      return UnauthorizedException({ message: "Invalid token type" });
  }
};