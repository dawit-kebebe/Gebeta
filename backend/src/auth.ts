import Router, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Player } from "./entity/Player";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const authRouter = Router();

export async function generateToken(req: Request): Promise<string | null> {
  const { username, password } = req.body;
  const userData = await AppDataSource.manager.findOne(Player, {
    where: { username: username, password: password },
  });

  if (!userData) {
    return null; // User not found
  }
  const payload = {
    id: userData.id,
    username: userData.username,
  };
  const secretKey: string = process.env.SECRETKEY;
  const options: object = { expiresIn: "1h" };
  const token:string = jwt.sign(payload, secretKey, options);
  return token;
}


export default authRouter.post("", async (req: Request, res: Response) => {
  const token = await generateToken(req);
  if (token) {
    // Set token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000, // 1 hour
    });
    res.status(200).json({ message: "Logged in successfully" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

