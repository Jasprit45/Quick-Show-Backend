import express from 'express';
import { addShow, getNowPlayingMovies } from '../controllers/showController.js';
import axios from 'axios';

const showRouter = express.Router();

showRouter.get('/now-playing', getNowPlayingMovies);
showRouter.post('/add', addShow);


export default showRouter;