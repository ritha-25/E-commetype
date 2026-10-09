import nodemailer from "nodemailer";

const createTransporter = () => {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
        throw new Error(
            `Brevo SMTP env vars missing — BREVO_SMTP_USER: ${process.env.BREVO_SMTP_USER ? "set" : "MISSING"}, BREVO_SMTP_PASS: ${process.env.BREVO_SMTP_PASS ? "set" : "MISSING"}`
        );
    }

    return nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false, // TLS via STARTTLS
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });
};

export const sendProductRegisteredEmail = async (
    to: string | string[],
    productName: string,
    price: number,
    stock?: number
) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.BREVO_SENDER_EMAIL}>`,
        to,
        subject: `Product added: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Product added successfully</h2>
                <p><strong>${productName}</strong> is now in the store.</p>
                <p>Price: ${price} &middot; Stock: ${stock ?? 0}</p>
            </div>
        `,
    });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.BREVO_SENDER_EMAIL}>`,
        to,
        subject: "Welcome to Ecommerce App!",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 480px;">
                <h2>Welcome, ${name}! 🎉</h2>
                <p>Your account has been created successfully.</p>
                <p>You can now log in and start shopping.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #888; font-size: 13px;">If you did not create this account, please ignore this email.</p>
            </div>
        `,
    });
};

export const sendOtpEmail = async (to: string, otp: string) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.BREVO_SENDER_EMAIL}>`,
        to,
        subject: "Your Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 480px;">
                <h2>Password Reset Request</h2>
                <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                            background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 24px 0;">
                    ${otp}
                </div>
                <p style="color: #888; font-size: 13px;">If you did not request this, ignore this email. Your password will remain unchanged.</p>
            </div>
        `,
    });
};
