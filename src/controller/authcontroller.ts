import { Request,RequestHandler,Response } from "express"
import crypto from "crypto";
import nodemailer from "nodemailer";
import { UserModel } from "../modle/User";
import { AuthVerification} from "../modle/AuthVerificationToken";
import { errorRes } from "../utiles/helper";
import jwt from "jsonwebtoken"



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

const link=`http://localhost:4000/verify?id=${user._id} && token=${token}`;
console.log(link);


// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "61652e59ff6224",
    pass: "65f7eb83eeb21b"
  }
});

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
  const {id ,token}=req.body;

  
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
  res.json({"message":"welcome to the app your gmail is verify"})






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
  const accessToken=jwt.sign(payload,"secret",{
    expiresIn:"15m"
  })
  const refreshToken=jwt.sign(payload,"secret")
  //store refersh token inside DB

  if(!user.tokens) user.tokens=[refreshToken]
  else user.tokens=[refreshToken];
  user.save()



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