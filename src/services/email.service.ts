import { createTransport } from "nodemailer";
import { env } from "@/config/env";
import { SendMailOptionsI } from "@/types";

const transport = createTransport({
  host: env.MAILTRAP_SMTP_HOST,
  port: Number(env.MAILTRAP_SMTP_PORT),
  auth: {
    user: env.MAILTRAP_SMTP_USER,
    pass: env.MAILTRAP_SMTP_PASS,
  },
});

export const mailService = {
  async sendVerificatinMail({ email, res, emailTemplate }: SendMailOptionsI) {
    try {
      await transport.sendMail({
        to: email,
        from: env.VERIFICATION_EMAIL,
        subject: "Account Verification",
        html: emailTemplate,
      });
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({
        status: "error",
        message: "Error sending verification email",
      });
    }
  },
};

export const EmailTemplate = {
  VerificationTemplate(verificationUrl: string): string {
    const currentYear = new Date().getFullYear();
    return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                text-align: center;
              }
              .email-container {
                background-color: #ffffff;
                max-width: 600px;
                margin: 30px auto;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
              }
              p {
                font-size: 16px;
                color: #555;
                margin-bottom: 20px;
              }
              a {
                display: inline-block;
                padding: 12px 25px;
                background-color: #4CAF50;
                color: #fff;
                text-decoration: none;
                font-size: 18px;
                border-radius: 5px;
                transition: background-color 0.3s ease;
              }
              a:hover {
                background-color: #45a049;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #aaa;
              }
              .footer a {
                color: #aaa;
                text-decoration: none;
              }
              @media (max-width: 600px) {
                .email-container {
                  padding: 15px;
                }
                h1 {
                  font-size: 22px;
                }
                p {
                  font-size: 14px;
                }
                a {
                  font-size: 16px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1>Email Verification</h1>
              <p>Hi there,</p>
              <p>Thank you for signing up! To complete your registration, please click the link below to verify your account:</p>
              <a href="${verificationUrl}">Verify Account</a>
              <p>If you did not sign up for an account, you can safely ignore this email.</p>
              <div class="footer">
                <p>&copy; ${currentYear} Sachin Company. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
  },
};
