import type { Schema, Types } from "mongoose";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { stripe } from "./checkout.controller";
import { HttpStatusCode } from "@/constant";
import type { BookDoc } from "@/model/Book/book.model";
import { OrderModel } from "@/model/order/order.model";
import { UserModel } from "@/model/user/user.model";
import type { StripeCustomer } from "@/types/stripe";
import type { UuidGType } from "@/validators";

export const getOrders: CustomRequestHandler = asyncHandler(async (req, res) => {
  type OrderItemList = {
    orderItems: {
      id: BookDoc;
      price: number;
      qty: number;
      totalPrice: number;
    }[];
  };

  const orders = await OrderModel.find({
    userId: req.user._id,
  })
    .populate<OrderItemList>("orderItems.id")
    .sort({ createdAt: -1 });

  type OrderDetails = {
    id: Types.ObjectId;
    stripeCustomerId?: string;
    paymentId?: string;
    totalAmount: string;
    paymentStatus?: string;
    date: Date;
    orderItem: {
      id?: Schema.Types.ObjectId;
      title: string;
      cover?: string;
      qty: number;
      price: string;
      totalPrice: string;
    }[];
  }[];

  const OrderResponse: OrderDetails = orders.map((item) => {
    return {
      id: item._id,
      stripeCustomerId: item.stripeCustomerId,
      paymentId: item.paymentId,
      totalAmount: item.totalAmount ? (item.totalAmount / 100).toFixed(2) : "0",
      paymentStatus: item.paymentStatus,
      date: item.createdAt,
      orderItem: item.orderItems.map(({ id: book, price, qty, totalPrice }) => {
        return {
          id: book._id,
          title: book.title,
          cover: book.cover?.url,
          qty,
          price: (price / 100).toFixed(2),
          totalPrice: (totalPrice / 100).toFixed(2),
        };
      }),
    };
  });

  res.status(HttpStatusCode.OK).json(
    new ApiResponse(
      HttpStatusCode.OK,
      {
        orders: OrderResponse,
      },
      "Orders fetched successfully"
    )
  );
});

export const getOrderStatus: CustomRequestHandler<
  object,
  UuidGType<["bookId"]>
> = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  let status = false;

  const user = await UserModel.findOne({ _id: req.user._id, books: bookId });

  if (user) {
    status = true;
  }

  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, { status }, "Order status fetched successfully"));
});

export const getOrderSuccessStatus: CustomRequestHandler<
  object,
  UuidGType<["sessionId"]>
> = async (req, res) => {
  const { sessionId } = req.params;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const customerId = session.customer;

  let customer: StripeCustomer;

  if (typeof customerId === "string") {
    customer = (await stripe.customers.retrieve(customerId)) as unknown as StripeCustomer;

    const { orderId } = customer.metadata;
    const order = await OrderModel.findById(orderId).populate<{
      orderItems: {
        id: BookDoc;
        price: number;
        qty: number;
        totalPrice: number;
      }[];
    }>("orderItems.id");

    if (!order) {
      throw new ApiError(HttpStatusCode.NotFound, "Order not found");
    }

    const data = order.orderItems.map(({ id: book, price, totalPrice, qty }) => {
      return {
        id: book._id,
        title: book.title,
        slug: book.slug,
        cover: book.cover?.url,
        price: (price / 100).toFixed(2),
        totalPrice: (totalPrice / 100).toFixed(2),
        qty,
      };
    });

    res.status(HttpStatusCode.OK).json(
      new ApiResponse(
        HttpStatusCode.OK,
        {
          orders: data,
          totalAmount: order.totalAmount ? (order.totalAmount / 100).toFixed(2) : "0",
        },
        "Order fetched successfully"
      )
    );
  }

  throw new ApiError(HttpStatusCode.NotFound, "Customer not found");
};
