import { Response } from "express";


export const errorRes=(res:Response,message:string,status:number)=>{

    return res.status(status).json({message});

}