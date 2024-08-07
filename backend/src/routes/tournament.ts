import { Router } from "express";

const tournamentRoute = Router();

export default tournamentRoute.get("/", (req, res) => {
  res.json("Game route");
});
