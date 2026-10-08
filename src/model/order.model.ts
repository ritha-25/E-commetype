import mongoose, { Document, Schema } from "mongoose";

interface IOrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    items: IOrderItem[];
    total: number;
    status: string;
}

const orderSchema = new Schema<IOrder>(
    {
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        total: { type: Number, required: true },
        status: { type: String, default: "confirmed" },
    },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
