import { isValidObjectId } from "mongoose";
import z from "zod";

export const cartItemsSchema = z.object({
  items: z.array(
    z.object({
      product: z
        .string({
          required_error: "Product id is missing!",
          invalid_type_error: "Invalid product id!",
        })
        .transform((arg, ctx) => {
          if (!isValidObjectId(arg)) {
            ctx.addIssue({ code: "custom", message: "Invalid product id!" });
            return z.NEVER;
          }

          return arg;
        }),
      quantity: z.number({
        required_error: "Quantity is missing!",
        invalid_type_error: "Quantity must be number!",
      }),
    })
  ),
});

export type NewCartItemType = z.infer<typeof cartItemsSchema>;
