// import cookieParser from "cookie-parser";
// import express from "express";
// import cors from 'cors';
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const app = express();

app.use(express.json());

app.use(cors({
    origin:[process.env.FRONTED_URL],
    credential:true
}));
app.use(cookieParser());
app.use('/ping', (req,res) => {
    res.send('pong')
})

app.use('/api/v1/user', userRoutes);

app.all('*', (req,res) => {
    res.status(404).send('OOPS!! 404 page not found');
})

app.use(errorMiddleware);

module.exports = app;