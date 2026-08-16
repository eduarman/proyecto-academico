import { z } from 'zod';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).+$/;

const strongPassword = (message: string) => z.string().min(8).regex(PASSWORD_REGEX, message);

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: strongPassword('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: strongPassword('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: strongPassword('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número'),
  })
  .strict();
