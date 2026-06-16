import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(10, "Title must be at least 10 characters"),

  description: z
    .string({
      required_error: "Description is required",
    })
    .min(30, "Description must be at least 30 characters"),

  category: z.enum(["web-dev", "logo-design", "content-writing", "social-media"], {
    errorMap: () => ({
      message: "Invalid category selected",
    }),
  }),

  price: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
      })
      .min(500, "Minimum price is Rs. 500")
  ),

  deliveryTime: z.preprocess(
    (val) => Number(val),
    z
      .number({
        required_error: "Delivery time is required",
        invalid_type_error: "Delivery time must be a number",
      })
      .min(1, "Minimum delivery time is 1 day")
  ),
});

export const updateServiceSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").optional(),
  description: z.string().min(30, "Description must be at least 30 characters").optional(),
  category: z
    .enum(["web-dev", "logo-design", "content-writing", "social-media"], {
      errorMap: () => ({
        message: "Invalid category selected",
      }),
    })
    .optional(),
  price: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(500, "Minimum price is Rs. 500").optional()
  ),
  deliveryTime: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z.number().min(1, "Minimum delivery time is 1 day").optional()
  ),
});
