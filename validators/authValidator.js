// validators/authValidator.js
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }).min(2, "Name must be at least 2 characters long"),

  email: z.string({
    required_error: "Email is required"
  }).email("Please enter a valid email address"),

  password: z.string({
    required_error: "Password is required"
  }).min(6, "Password must be at least 6 characters"),

  role: z.enum(["customer", "provider"], {
    errorMap: () => ({ 
      message: "Role must be either customer or provider" 
    })
  })
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required"
  }).email("Please enter a valid email address"),

  password: z.string({
    required_error: "Password is required",
  }).min(1, "Password is required")
});
