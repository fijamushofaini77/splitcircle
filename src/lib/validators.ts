import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi.'),
  email: z.string().trim().email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});
