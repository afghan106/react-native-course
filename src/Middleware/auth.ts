import { RequestHandler } from "express";
import { errorRes } from "../utiles/helper";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken"
import { UserModel } from "../modle/User";
import { verify } from "crypto";



export const isAuth:RequestHandler=async(req:any,res,next)=>{

   try {
       //read authorization header
    const authtoken=req.headers.authorization;


    //see if we have the token
    if (!authtoken) {
      errorRes(res,"unauthorized access ",403);
    }

   
    //"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWJkNjM1ZDRjOWU0ZjYwMTQyMzM4OSIsImlhdCI6MTc2NzgxNDIxMywiZXhwIjoxNzY3ODE1MTEzfQ.oEnVp-gkR5JWKTGVG0gDuYklvzzJX_l41BhNq7tndLA"
    const token=authtoken.split("Bearer ")[1];

   
    //verify the token (jwt.verify ) as payload
    const payload=jwt.verify(token,"secret")as {id:string}
    //take out the user id from token( have as payload)

   const user =await UserModel.findById(payload.id);

   //check if we have the use with this id
   if(!user){
      errorRes(res,"unauthorized access please login the user",403)
   }


    //send the error if not exist
    //attach use profile inside req object
    req.user={
      id:user?._id,
      name:user?.name,
      verify:user?.verify,
      gmail:user?.gmail,
      
    }
    //call next() function to do further changes in the route

    next()
    //handle errors for expired tokens

   } catch (error) {
     if (error instanceof TokenExpiredError) {
      errorRes(res,"the token has been expired please login again",401)
      
     }
     if (error instanceof JsonWebTokenError) {
      errorRes(res,"error in token",401)
     }
   }
}