import mongoose, { Mongoose } from "mongoose";

const url="mongodb://127.0.0.1:27017/ReactNative"
export async function connectDB(){

    try {
        await mongoose.connect(url)
        console.log('the database is connected successfully');

    } catch (error) {
        console.log(error);
    }
}