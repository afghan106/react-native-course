const express=require('express');
import {Request,Response} from 'express';
import authRouter from "./src/Routes/authRouts"
import {connectDB} from './src/db/index';
const dotenv=require('dotenv').config();

const app=express();
const port=4000;
app.use(express.json());
app.use(express.static("src/public"));

connectDB();

app.use(authRouter);

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
}); 


