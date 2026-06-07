import { err } from "inngest/types";
import Booking from "../models/Booking.js";
import Show from "../models/shows.js";
import User from "../models/user.js";



//api to check if user is admin
export const isAdmin = async (req,res) => {
    res.json({success: true, isAdmin: true});
}

//get dasboard data

export const getDashboradData = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid:true});
        
        const activeShows = await Show.find({showDateTime: {$gte : new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboradData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({
            success: true,
            dashboradData
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

//to get all shows 
export const getAllShows = async (req, res) => {
    try {
        const shows = await (await Show.find({showDateTime: {$gte: new Date()}}).populate('movie')).sort({showDateTime: 1});

        res.json({
            success: true,
            shows
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

//to get all bookings

export const getAllBookings = async (req, res)  => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt: -1});
        
        res.json({success:true, bookings});
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}