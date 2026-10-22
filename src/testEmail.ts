import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
    console.log("BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER);
    console.log("BREVO_SMTP_PASS length:", process.env.BREVO_SMTP_PASS?.length);
    console.log("BREVO_SENDER_EMAIL:", process.env.BREVO_SENDER_EMAIL);

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });

    await transporter.verify();
    console.log("Brevo SMTP login OK");

    const info = await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: process.env.BREVO_SENDER_EMAIL,
        subject: "Brevo Test",
        text: "Brevo works!",
    });

    console.log("Sent:", info.response);
}

main().catch((e) => console.error("FAILED:", e));
