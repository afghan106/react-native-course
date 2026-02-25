import nodemailer from "nodemailer"

    // Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "86c5c44b486f75",
    pass: "9296df77e3e5fe"
  }
});
const verification=async(gmail:string,link:string)=>{



transport.sendMail({
    from :"shakir@gmail.com",
    to:gmail,
    html:`<h1>please <a href="${link}">click</a> here to verify you account</h1>`

})
}

const resetpassword=async(gmail:string,link:string)=>{



transport.sendMail({
    from :"shakir@gmail.com",
    to:gmail,
    html:`<h1>please <a href="${link}">click</a> here to verify you account</h1>`

})
}




export const mail={
    verification,
    resetpassword
}