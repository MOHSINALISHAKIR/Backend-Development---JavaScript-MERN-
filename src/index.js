import express from 'express'
import 'dotenv/config'
import connectDB from './database/connect.js'
const app = express()
connectDB();
app.listen(process.env.PORT,()=>{
    console.log("server start")
})