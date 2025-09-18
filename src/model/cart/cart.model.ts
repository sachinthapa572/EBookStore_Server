import { model, type ObjectId, Schema } from "mongoose";

type CartItem = {
  product: ObjectId;
  quantity: number;
};

type CartDocument = {
  userId: ObjectId;
  items: CartItem[];
};

const cartSchema = new Schema<CartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const CartModel = model<CartDocument>("Cart", cartSchema);
export default CartModel;
