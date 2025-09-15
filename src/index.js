import express from 'express'
import 'dotenv/config'
import connectDB from './database/connect.js'
import { app } from './app.js';


connectDB();
app.listen(process.env.PORT,()=>{
    console.log("server start")
})