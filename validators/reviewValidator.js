import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5"),

  comment: z.string().optional(),
});
