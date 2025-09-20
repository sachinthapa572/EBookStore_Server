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
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
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
