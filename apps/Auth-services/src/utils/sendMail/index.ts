// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import ejs from "ejs";
// import path from "path";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   service: process.env.SMTP_SERVICE,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// //Render the EJS template and send the email
// const renderEmailTemplate = async (templateName: string, data: Record<string, any> ) => {
//     const templatePath = path.join(
//         process.cwd(),
//         "auth-services",
//         "src",
//         "utils",
//         "email-templates",
//         `${templateName}.ejs`
//     );
//     return await ejs.renderFile(templatePath, data);
// };

// //send email function
// export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
//     try{
//         const html = await renderEmailTemplate(templateName, data);

//         await transporter.sendMail({
//             from: `<${process.env.SMTP_USER}>`,
//             to,
//             subject,
//             html,
//         });
//         return true;
//     }
//     catch(error){
//         console.error("Error sending email:", error);
//         return false;   
//     }
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log(
  "SMTP_PASSWORD:",
  process.env.SMTP_PASSWORD ? "Loaded ✅" : "Missing ❌"
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Render the EJS template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
) => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "Auth-services",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );

  console.log("📄 Template Path:", templatePath);

  return await ejs.renderFile(templatePath, data);
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};