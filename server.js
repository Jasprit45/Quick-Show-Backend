import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { setDefaultResultOrder } from 'dns';
// setDefaultResultOrder('ipv4first');

const app = express();
const port = 3000;

await connectDB();

//middlewares
app.use(express.json());
app.use(cors());


//API Routes
app.get("/", (req,res)=>{
    res.send("Server is live !!");
});


app.listen(port, ()=>{
    console.log(`Server is runnig on ${port}`);
});