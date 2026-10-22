import mongoose, { Document, Schema } from "mongoose";

interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    items: ICartItem[];
    user: mongoose.Types.ObjectId;
}

const cartSchema = new Schema<ICart>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
                quantity: { type: Number, required: true, default: 0 },
            },
        ],
    },
);

cartSchema.index(
    { user: 1 },
    { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
