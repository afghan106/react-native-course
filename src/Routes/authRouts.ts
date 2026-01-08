import { Router,Request,Response } from "express";
import { sendprofile, signin, Singup, verify } from "../controller/authcontroller";
import { isAuth } from "../Middleware/auth";

 const authRouter=Router();


authRouter.post("/signup",Singup);
authRouter.post("/verify",verify);
authRouter.post("/signin",signin);
authRouter.get("/sendprofile",isAuth,sendprofile);





export default authRouter;