import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './Routes/showRoutes.js';
import bookingRouter from './Routes/bookingRoutes.js';
import adminRouter from './Routes/adminRoutes.js';


const app = express();
const port = 3000;
app.use(clerkMiddleware());


//middlewares
app.use(express.json());
app.use(cors());


//API Routes
app.get("/", (req,res)=>{
    res.send("Server is live !!");
});
app.use('/api/inngest',serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin',adminRouter);

await connectDB();

app.listen(port, ()=>{
    console.log(`Server is runnig on ${port}`);
});