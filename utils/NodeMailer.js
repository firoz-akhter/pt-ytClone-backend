import nodemailer from "nodemailer";
// Configure Nodemailer
export const transporter = ()=>{
  return (
    nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail password or app-specific password
      },
    
      
    })
  )
} 
