import mongoose, { Document, Schema } from "mongoose";

interface IOrderItem {
    product: mongoose.Types.ObjectId;
    seller?: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    items: IOrderItem[];
    total: number;
    status: string;
    user: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>(
    {
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                seller: { type: Schema.Types.ObjectId, ref: "User" },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        total: { type: Number, required: true },
        status: { type: String, default: "confirmed" },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
