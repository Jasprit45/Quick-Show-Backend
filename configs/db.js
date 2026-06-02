import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=>{
            console.log("Database Connected");
        });
        // console.log(`${process.env.MONGODB_URI}/quickshow`);
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);
    } catch (error) {
        console.error(error.message);
        console.error(error.stack);
    }
}

export default  connectDB;