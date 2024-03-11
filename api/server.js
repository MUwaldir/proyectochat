import express from 'express';
import app from './src/app.js';
import { connectDB } from './src/bd.js';

const port = 3001
app.listen(port, (req, res, next) => {
    connectDB()
    console.log(`Listening on http://localhost:${port}`)
})