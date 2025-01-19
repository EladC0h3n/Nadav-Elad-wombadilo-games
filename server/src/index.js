import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import messagesRouter from './routes/messages.routes.js';
import gameRouter from './routes/game.routes.js';

import { connectDB } from './lib/db.js';
import {app, server} from './lib/socket.js';

import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5050;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/game", gameRouter);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
  });
}

server.listen(PORT,() => {
    console.log(`Listening on port ${PORT}`)
    connectDB();
});