import express from 'express';
import { addShow, getNowPlayingMovies, getShow, getShows } from '../controllers/showController.js';
import axios from 'axios';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin, getNowPlayingMovies);
showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);
showRouter.post('/add',protectAdmin, addShow);



export default showRouter;