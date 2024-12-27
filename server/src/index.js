import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js'
import { connectDB } from './lib/db.js';
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth",authRouter);
app.use("/api/messages",messagesRouter);


app.listen(PORT,() => {
    console.log(`Listening on port ${PORT}`)
    connectDB();
});