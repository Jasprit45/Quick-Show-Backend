import axios from "axios"
import Movie from "../models/movie.js";
import Show from "../models/shows.js";
import https from 'https'
import tmdbAxios from "../configs/axiosInstance.js"; 
import Booking from "../models/Booking.js";
import  stripe from 'stripe'

//check availability of selected seats for a movie
const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId);
        if(!showData) {
            return false;
        }

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;

    } catch (error) {
        console.log(error);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const { origin } = req.headers;

        //check if seats are available or not 
        const isAvialable =  checkSeatAvailability(showId, selectedSeats);

        if(!isAvialable) return res.json({success: false, message: "Selected seats are not available"});

        //get show details
        const showData = await Show.findById(showId).populate('movie');

        //create new booking

        const booking = await Booking.create({
            user:userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
        });

        selectedSeats.map((seat)=> {
            showData.occupiedSeats[seat] = userId
        });

        showData.markModified('occupiedSeats');

        await showData.save();

        //todo: stripe gateway initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //creating line item to for stripe 
        const line_items = [{
            price_data: {
                currency: 'aud',
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session  =await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, //expires in 30min
        })

        booking.paymentLink= session.url
        await booking.save();


        res.json({
            success:true,
            url: session.url
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const {showId} = req.params;
        const showData = await Show.findById(showId);

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        res.json({
            success: true,
            occupiedSeats
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}