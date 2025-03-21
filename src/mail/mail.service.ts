import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get<string>("EMAIL_HOST"),
            port: this.config.get<number>("EMAIL_PORT"),
            secure: false,
            auth: {
                user: this.config.get<string>("EMAIL_USERNAME"),
                pass: this.config.get<string>("EMAIL_PASSWORD")
            },
        });
    }
    async sendResetPasswordEmail(email: string, otp: string) {

        const mailOptions: nodemailer.sendOptions = {
                from: this.config.get("EMAIL_USERNAME"),
                to: email,
                subject: 'Reset Your Password - OTP Verification',
                html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #d9534f; margin: 20px 0;">
                        ${otp}
                    </p>
                    <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Regards,</p>
                    <p><strong>Company Name</strong></p>
                    </div>`,
        };
        try {
            console.log(this.config.get<string>("EMAIL_USERNAME"))
            console.log(this.config.get<string>("EMAIL_PASSWORD"))
            console.log(mailOptions)
            const info = await this.transporter.sendMail(mailOptions);
            console.log("OTP Email sent : ",info)
            return info
        } catch(error) {
            console.log("ERROR SENDING EMAIL ",error)
            throw new InternalServerErrorException("ERROR SENDING EMAIL")
        }
        
    }
}
