import axios from "axios"

export const getNowPlayingMovies = async (req,res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers : {
                accept: 'application/json',
                Authorization : `Bearer ${process.env.TMDB_API_KEY}`}
        });

        const movies = response.data.results;
        res.json({
            success:true,
            movies:movies
        });

    } catch (error) {
        console.error(error);
        res.json({
             success:false,
            message:error.message
        });
    }
}