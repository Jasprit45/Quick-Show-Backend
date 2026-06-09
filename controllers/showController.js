import axios from "axios"
import Movie from "../models/movie.js";
import Show from "../models/shows.js";
import https from 'https'
import tmdbAxios from "../configs/axiosInstance.js";  // ← use shared instance

export const getNowPlayingMovies = async (req, res) => {
  try {
    const response = await tmdbAxios.get("/movie/now_playing");  // baseURL already set
    console.log("Success");

    res.json({
      success: true,
      movies: response.data.results,
    });

  } catch (error) {
    console.error("Error:", error.code, error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const addShow = async (req, res) => {
    try {
        const {movieId, showsInput, showPrice} = req.body;
        // console.log( "Req payload Body :",req.body);
        let movie = await Movie.findById(movieId);
        // console.log(movie);

        if(!movie) {
            //fetch movie details from tmdb
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                tmdbAxios.get(`/movie/${movieId}`),          // ← no headers needed
                tmdbAxios.get(`/movie/${movieId}/credits`)   // ← baseURL already set
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            // console.log(movieApiData);

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,        // ← was movieApiData.casts (bug fix)
                release_date: movieApiData.release_date, // ← was release_data (bug fix)
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,  
            }

            //add movie to db 
            movie = await Movie.create(movieDetails);
        }      

            const showsToCreate = [];
            showsInput.forEach(show => {
                const showDate = show.date;
                show.time.forEach((time)=> {
                    const dateTimeString = `${showDate}T${time}`;
                    showsToCreate.push({
                        movie: movieId,
                        showDateTime: new Date(dateTimeString),
                        showPrice,
                        occupiedSeats: {}
                    })
                })
            });
            if(showsToCreate.length > 0) {
                await Show.insertMany(showsToCreate);
            }

            res.json({success: true, message: 'Show Added Successfully.'});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


//to get all shows from db
export const getShows = async (req, res) => {
    try {
        const now = new Date();
        const shows = await Show.find({
            showDateTime: {
                $gte: now
            }
        })
        .populate("movie")
        .sort({ showDateTime: 1 });

        //filter unique shows 
        const uniqueShows = new Set(shows.map(show => show.movie));

        res.json({
            success: true,
            shows: Array.from(uniqueShows),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//to get single show from db
export const getShow = async (req, res) => {
    try {
        const {movieId} = req.params;
        //get all upcoming shows for this movie
        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}} );

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if(!dateTime[date]){
                dateTime[date] = [];
            }
            dateTime[date].push({time:show.showDateTime,
                showId: show._id
            });
        });

        res.json({
            success: true,
            movie,
            dateTime
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
