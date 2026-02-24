import nodemailer from "nodemailer"

    // Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
const verification=async(gmail:string,link:string)=>{



transport.sendMail({
    from :"shakir@gmail.com",
    to:gmail,
    html:`<h1>please <a href="${link}">click</a> here to verify you account</h1>`

})
}



export const mail={
    verification

}