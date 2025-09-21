import { type Model, model, type ObjectId, Schema } from "mongoose";

type OrderItem = {
  id: ObjectId;
  price: number;
  qty: number;
  totalPrice: number;
};

type OrderDoc = {
  userId: ObjectId;
  orderItems: OrderItem[];
  stripeCustomerId?: string;
  paymentId?: string;
  totalAmount?: number;
  paymentStatus?: string;
  paymentErrorMessage?: string;
  createdAt: Date;
};

const orderSchema = new Schema<OrderDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be non-negative"],
        },
        totalPrice: {
          type: Number,
          required: true,
          min: [0, "Total price must be non-negative"],
        },
        qty: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    stripeCustomerId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
    },
    paymentErrorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const OrderModel = model<OrderDoc>("Order", orderSchema) as Model<OrderDoc>;
