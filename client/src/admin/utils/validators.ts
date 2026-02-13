import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Product validation schema
export const productColorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  image: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  longDescription: z.string().min(1, 'Long description is required'),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  category: z.enum(['Clothing', 'Electronics', 'Accessories']),
  badge: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  sizes: z.array(z.string()).min(1, 'At least one size required'),
  colors: z.array(productColorSchema).min(1, 'At least one color required'),
  features: z.array(z.string()),
  sizePriceAdjustments: z.record(z.string(), z.number()).optional(),
  variantStock: z.array(z.object({
    color: z.string(),
    size: z.string(),
    stock: z.number().min(0),
  })).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// Profile update schema
export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
