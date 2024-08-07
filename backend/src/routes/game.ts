import { Request, Response } from "express";
import { Router } from "express";
import authUser from "../auth.middleware";
import { verifyToken } from "../auth.middleware";
const gameRoute = Router();

export default gameRoute.get("", (req: Request, res: Response) => {
  const User = verifyToken(req, res); // this function return verified user information
  res.json(User);
});
