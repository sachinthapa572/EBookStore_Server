import type { Types } from "mongoose";

export type CartItem = {
  product: string;
  quantity: number;
};

export type CartUpdateData = {
  items: CartItem[];
};

export type PopulatedCartItem = {
  quantity: number;
  product: {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    cover?: { url: string; id: string };
    price: { mrp: number; sale: number };
  };
};

export type CartResponse = {
  id: Types.ObjectId;
  items: {
    quantity: number;
    product: {
      id: Types.ObjectId;
      title: string;
      slug: string;
      cover?: string;
      price: {
        mrp: string;
        sale: string;
      };
    };
  }[];
};

export type CartUpdateResult = {
  cart: Types.ObjectId;
};
