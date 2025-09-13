import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async()=>{
    mongoose.connection.on("connected",()=>{
        console.log("connect to db..")
    })
    await mongoose.connect(`${process.env.MONGO_DB}/${DB_NAME}`)
}
export default connectDB;