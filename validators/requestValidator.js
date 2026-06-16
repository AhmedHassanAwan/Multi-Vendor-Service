import { z } from 'zod';

export const createRequestSchema = z.object({
  requirements: z
    .string({
      required_error: "Requirements are required",
    })
    .min(20, "Requirements must be at least 20 characters"),

  budget: z
    .number({
      required_error: "Budget is required",
      invalid_type_error: "Budget must be a number",
    })
    .min(500, "Minimum budget is Rs. 500"),

  deadline: z
    .string({
      required_error: "Deadline is required",
    })
    .refine((date) => new Date(date) > new Date(), "Deadline must be a future date"),
});
