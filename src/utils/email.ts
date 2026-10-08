import nodemailer from "nodemailer";

const createTransporter = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

export const sendProductRegisteredEmail = async (
    to: string | string[],
    productName: string,
    price: number,
    stock?: number
) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Ecommerce App" <${process.env.EMAIL_USER}>`,
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
        from: `"Ecommerce App" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Welcome!",
        html: `<h2>Welcome, ${name}!</h2><p>Your account was created successfully.</p>`,
    });
};