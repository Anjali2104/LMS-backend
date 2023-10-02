import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import errorMiddleware from "./middlewares/errorMiddleware.js";
import morgan from "morgan";

const app = express();

app.use(express.json());

app.use(cors({
    origin:[process.env.FRONTED_URL],
    credential:true
}));

app.use(morgan('dev'));

app.use(cookieParser());

app.use('/ping', (req,res) => {
    res.send('pong')
})

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses',courseRoutes);

app.all('*', (req,res) => {
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);

export default app;