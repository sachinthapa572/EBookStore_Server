import { z } from "zod";

// Schema for instant checkout validation
export const instantCheckoutSchema = z.object({
  productId: z.string().min(1, "Product ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
});

// Export the inferred type for use in controllers
export type InstantCheckoutInput = z.infer<typeof instantCheckoutSchema>;