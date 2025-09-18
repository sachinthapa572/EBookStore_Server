import type { ObjectId } from "mongoose";

import { ApiError } from "@/utils/ApiError";

import type {
  CartResponse,
  CartUpdateData,
  CartUpdateResult,
  PopulatedCartItem,
} from "./cart.type";
import { HttpStatusCode } from "@/constant";
import CartModel from "@/model/cart/cart.model";

class CartService {
  // Update cart items (add, update, or remove items)
  async updateCart(userId: ObjectId, cartData: CartUpdateData): Promise<CartUpdateResult> {
    const { items } = cartData;

    let cart = await CartModel.findOne({ userId });

    if (cart) {
      // Update existing cart
      for (const item of items) {
        const oldProduct = cart.items.find(
          ({ product }) => item.product === product.toString()
        );

        if (oldProduct) {
          oldProduct.quantity += item.quantity;
          // If quantity is 0 or less, remove product from cart
          if (oldProduct.quantity <= 0) {
            cart.items = cart.items.filter(({ product }) => oldProduct.product !== product);
          }
        } else {
          cart.items.push({
            product: item.product as unknown as ObjectId,
            quantity: item.quantity,
          });
        }
      }

      await cart.save();
    } else {
      // Create new cart
      cart = await CartModel.create({ userId, items });
    }

    return { cart: cart._id };
  }

  // Get user's cart with populated product details
  async getUserCart(userId: ObjectId): Promise<CartResponse> {
    const cart = await CartModel.findOne({ userId }).populate<{
      items: PopulatedCartItem[];
    }>({
      path: "items.product",
      select: "title slug cover price",
    });

    if (!cart) {
      throw new ApiError(HttpStatusCode.NotFound, "Cart not found");
    }

    return {
      id: cart._id,
      items: cart.items.map((item) => ({
        quantity: item.quantity,
        product: {
          id: item.product._id,
          title: item.product.title,
          slug: item.product.slug,
          cover: item.product.cover?.url,
          price: {
            mrp: (item.product.price.mrp / 100).toFixed(2),
            sale: (item.product.price.sale / 100).toFixed(2),
          },
        },
      })),
    };
  }

  // Clear all items from user's cart
  async clearUserCart(userId: ObjectId): Promise<void> {
    await CartModel.findOneAndUpdate({ userId }, { items: [] });
  }
}

export const cartService = new CartService();
