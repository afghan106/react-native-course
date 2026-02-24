import { Router,Request,Response } from "express";
import {signOut,generateRefreshToken, generateVerificationLink, sendprofile, signin, Singup, verify, forgetPassword } from "../controller/authcontroller";
import { isAuth } from "../Middleware/auth";


 const authRouter=Router();


authRouter.post("/signup",Singup);
authRouter.post("/verify",verify);
authRouter.get("/verify-token",isAuth,generateVerificationLink);

authRouter.post("/signin",signin);
authRouter.get("/sendprofile",isAuth,sendprofile);
authRouter.post("/refresh-token",generateRefreshToken);
authRouter.post("/signout",isAuth,signOut);
authRouter.post("/forget-password",forgetPassword);







export default authRouter;