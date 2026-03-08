import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './Config/mongodb.js';
import authRouter from './routes/authRoutes.js' 
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT||4000
connectDB()



app.use(express.json());
app.use(cookieParser());

const cors = require('cors');

const allowedOrigins = [
  'https://mern-auth-k9fo.vercel.app', // Your production URL
  'http://localhost:5173'              // Your local development URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.get('/' ,(req,res )=> res.send("API working fin") );
app.use('/api/auth' , authRouter)
app.use('/api/user' , userRouter )

app.listen(port , ()=> console.log(`Server started on port ${port}`));


module.exports = app; //for vercel