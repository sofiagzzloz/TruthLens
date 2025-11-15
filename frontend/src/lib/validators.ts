import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(32, "Username must be less than 32 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/\d/, "Include at least one number"),
});

export const loginSchema = z.object({
  identifier: z.string().min(2, "Username or email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  username: registerSchema.shape.username,
  email: registerSchema.shape.email,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: registerSchema.shape.password,
    confirmNewPassword: z.string().min(8, "Please confirm your new password"),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "Passwords must match",
      });
    }
  });

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
