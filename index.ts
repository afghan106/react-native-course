const express=require('express');
import {Request,Response} from 'express';
import authRouter from "./src/Routes/authRouts"
import {connectDB} from './src/db/index'

const app=express();
const port=4000;
app.use(express.json());
connectDB();

app.use(authRouter);

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
}); 


