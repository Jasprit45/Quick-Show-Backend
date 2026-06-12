import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
   service: 'gmial',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.verify();
// console.log("SMTP verified");

const sendEmail  = async ({to,subject,body}) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html:body,
    })
    return response;
}

export default sendEmail;