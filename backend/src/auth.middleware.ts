import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
// the verifyed user id can be access from any router by importing the ` verifyToken ` function from authuser middleware
// check the token and verify it.
export function verifyToken(req: Request, res: Response): void | number {
  try {
    const reqToken = req.cookies.token;
    if (reqToken) {
      const verifiedUser = jwt.verify(
        reqToken,
        process.env.SECRETKEY,
        (err, decodedToken) => {
          if (decodedToken) {
            return decodedToken;
          } else {
            res.status(401).json({ Msg: "Please sign up first " });
          }
        }
      );

      return verifiedUser; // decoded token
    }
  } catch (e) {
    res.status(500).json({ Msg: "Internal server error" });
  }
}

export default async function authUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const verifyedUserId = verifyToken(req, res);
  if (verifyedUserId) {
    next();
  }
}
