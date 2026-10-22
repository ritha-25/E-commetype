import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    category: string;
    price: number;
    stock: number;
    seller?: mongoose.Types.ObjectId;
    images: { url: string; publicId: string }[];
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        seller: { type: Schema.Types.ObjectId, ref: "User", default: null },
        images: {
            type: [
                {
                    url: { type: String, required: true },
                    publicId: { type: String, required: true },
                },
            ],
            default: [],
        },
    },
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
