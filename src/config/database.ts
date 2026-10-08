import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL as string);
        console.log("MongoDB Connected ");
    } catch (error) {
        console.log("DB Connection Failed", error);
        process.exit(1);
    }
};
