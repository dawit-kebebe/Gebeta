import express from "express";
import { AppDataSource } from "./data-source";
import authRouter from "./auth";
// import ve
import gameRoute from "./routes/game";
import tournamentRoute from "./routes/tournament";
import authUser from "./auth.middleware";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
// creating express server and port
const app = express();

const port = process.env.PORT || 3000;
// middlewares
app.use(express.json());
app.use(cookieParser());

AppDataSource.initialize()
  .then(async () => {
    // **************************
    app.get("/", (req, res) => {
      res.send("Welcome To Gebeta ");
    });
    // *****************************
    app.use("/login", authRouter);
    //  ****************************
    app.use("/game", authUser, gameRoute);
    //  ****************************
    app.use("/tournament", authUser, tournamentRoute);

    // listening the server working
    app.listen(port, () => {
      console.log(`Server is runing on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
