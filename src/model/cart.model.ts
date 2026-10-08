import mongoose, { Document, Schema } from "mongoose";

interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
    {
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, default: 0 },
            },
        ],
    },
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
