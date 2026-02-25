import { Request,RequestHandler,Response } from "express"
import crypto from "crypto";
import nodemailer from "nodemailer";
import { UserModel } from "../modle/User";
import { AuthVerification} from "../modle/AuthVerificationToken";
import { errorRes } from "../utiles/helper";
import jwt from "jsonwebtoken"
import mongoose, { set } from "mongoose";
import { mail } from "../utiles/mail";
import { access } from "fs";
import { PasswordResetTokenModel } from "../modle/passwordResetToken";






export  const Singup=async(req:Request,res:Response)=>{

try {
  // 1. read incoming data like : name ,email,password;
const {name,gmail,password}=req.body;
if(!password) return errorRes (res,"password is required",400);
if(!name) return errorRes(res,"name is required",400);
if(!gmail) return errorRes (res,"gmail is required",400);

//2. validate if the data is ok or not .


// 3. send error if not sent

// 4. check if we already have account with same userInfo.
const existingUser=await UserModel.findOne({gmail});
// 5. send error if yes otherwise create new acount and save user inseide database.
if(existingUser)
    
    return errorRes(res,"user already exist",400);
   const user=await UserModel.create({gmail,name,password});
// 6. Generate and store verification token .
const token=crypto.randomBytes(36).toString('hex');

await AuthVerification.create({owner:user._id,token})

const link=`${process.env.LINK}?id=${user._id}&token=${token}`;
console.log(link);


// Looking to send emails in production? Check out our Email API/SMTP product!
// var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "21332e59ff6224",
//     pass: "11321231232322"
//   }
// });

// transport.sendMail({
//     from :"shakir@gmail.com",
//     to:user.gmail,
//     html:`<h1>please <a href="${link}">click</a> here to verify you account</h1>`

// })

res.json({message:"please check you gmail addrass to verify your gmail",link})

} catch (err:any) {
  res.json({message:err.message})
}
  
}

//verify the email with token 
export const verify:RequestHandler=async(req,res)=>{


  //read incoming data like : id and token that send to email
    const id = req.body.id.trim();
    const token = req.body.token.trim();

  if(!mongoose.Types.ObjectId.isValid(id)) return errorRes(res,"the user id is not valid",403);
  if(!token || token.length===0) return errorRes(res,"the token is required ",403);

  //find the token inside the database 
  const authToken=await AuthVerification.findOne({owner:id});
  //send error if token not found .
  if(!authToken)return errorRes(res,"the token dose not find in our database",403);
  //check if the token is valid or not (ecnrypted)
  const isMatched=await authToken.compareToken(token);
  //if not valid send error otherwise update user is verified
  if(!isMatched) return errorRes(res,"the token dose not matched ",403)

  await UserModel.findByIdAndUpdate(id,{verify:true});
  //remove token from database 
await AuthVerification.findByIdAndDelete(authToken._id);
  //send success message
  errorRes(res,"welcome to the app your gmail is verify successfully",200);
}
//signin controller
export const signin:RequestHandler=async function(req,res){
  //read incoming data
  const {gmail,password}=req.body;

  if(!gmail && !password) return errorRes(res,"the gmail and password fields are required",403);
  // find user with the provided email
  const user=await UserModel.findOne({gmail:gmail});
  //send error if user not found 
if(!user)return errorRes(res,"user dose not find in the database",403);
  //check if the password is valid or not (encrypted)
  const passwordMatched=await user.comparePassword(password);

  //validation of the password if not valid send errro
  if(!passwordMatched) return errorRes(res,"the password is not matched please enter correct password",403)


    const payload={id:user._id};
  // otherwise generate access & referesh token
  const accessToken=jwt.sign(payload,process.env.SECRET!,{
    expiresIn:"5m"
  })
  const refreshToken=jwt.sign(payload,process.env.SECRET!); 
  //store refersh token inside DB

  if(!user.tokens) user.tokens=[refreshToken]
  else user.tokens.push(refreshToken);
  await user.save()



  //Send both tokens to user

res.json({
  profile:{
user
  },
 refreshToken: refreshToken,
 accesstoken: accessToken
})


}
//send profile info to client sid e
export const sendprofile:RequestHandler=(req:any,res)=>{

  res.json(
    {
      profile:req.user
    }
  )
}


export const generateVerificationLink:RequestHandler=async(req:any,res)=>{
//check if user is authenticated or not
const {id}=req.user;
const token=crypto.randomBytes(36).toString("hex");
const link=`${process.env.LINK}?id=${id}&token=${token}`;
// remove previus token if any
await AuthVerification.findOneAndDelete({owner:id});
await AuthVerification.create({owner:id,token});


//send link in gmail
//  mail.verification(req.user.gmail,link);

res.json({message:"please check you gmail for verification","Link":link});
//create/store new token and send response back


}


export const generateRefreshToken:RequestHandler=async(req,res)=>{

const {refreshToken}=req.body;


const payload=jwt.verify(refreshToken,process.env.SECRET!) as {id:string};

const user=await UserModel.findOne({
  _id:payload.id,
  tokens:refreshToken
})

if(!user){
  await UserModel.findByIdAndUpdate(payload.id,{tokens:[]});
  return errorRes(res,'the token has been compromised please singn in again',403);
}

const newAccessToken=jwt.sign({id:user._id},process.env.SECRET!,{
  expiresIn:'5m'
});
const newRefreshToken=jwt.sign({id:user._id},process.env.SECRET!); 



user.tokens=user.tokens.filter(t=>t!==refreshToken);
user.tokens.push(newRefreshToken);
user.save();

res.json({tokens:{
  refresh:newRefreshToken,
  access:newAccessToken
}})

  //read and verify the refresh token
  // find the user with payload;
  // if the refresh token is valid and no user found , token is compromised
  // remove all the previus tokens and send error response

  // remove previous token , update user and send new token



}


//signout
export const signOut:RequestHandler=async(req:any,res)=>{

//remove the refresh tokens
const {refreshtoken}=req.body;

const user=await UserModel.findOne({
  _id:req.user.id,
  tokens:refreshtoken
});

if(!user) return errorRes(res,"the token is not valid",403);

user.tokens=user.tokens.filter(t=>t!==refreshtoken);
await user.save();

res.json({message:"you signed out successfully"})

}




export const forgetPassword:RequestHandler=async(req,res)=>{

const {email}=req.body;

const user=await UserModel.findOne({gmail:email});

if(!user) return errorRes(res,"user dose not find with this email",403);

const token=crypto.randomBytes(36).toString("hex");

await PasswordResetTokenModel.findOneAndDelete({owner:user._id});

await PasswordResetTokenModel.create({owner:user._id,token});

const link=`${process.env.RESET_PASSWORD_LINK}?id=${user._id}&token=${token}`;

await mail.resetpassword(user.gmail,link);

res.json({message:"please check your email to reset your password"});


//ask for user email
//find user with the provided email
//if user not found send error
//generate random token and save it in database with user id (first remove previus token if any)

//gemerate reset password link with token and send it to user email;
//send email to user containg the link with token (link we did in verification process but with different token and different link)
//create response to client side back with success message




}