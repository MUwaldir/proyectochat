import express from 'express';
import app from './src/app.js';
import { connectDB } from './src/bd.js';
import server from './src/app.js';

const port = 3001
server.listen(port, (req, res, next) => {
    connectDB()
    console.log(`Listening on http://localhost:${port}`)
})