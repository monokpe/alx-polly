import { createClient } from "@/lib/supabase/server";
import { LoginFormData, RegisterFormData } from "../types";
import { AppError, handleError } from "../utils/error-utils";
import { rateLimiter } from "../utils/rate-limiter";
import { AUTH } from "../config/constants";

export class AuthService {
  static async login(data: LoginFormData) {
    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      // Rate limiting check
      if (rateLimiter.isLimited(normalizedEmail)) {
        throw new AppError(
          "Too many login attempts. Please try again later.",
          429
        );
      }

      // Email validation
      if (!AUTH.VALIDATION.EMAIL_REGEX.test(normalizedEmail)) {
        throw new AppError("Invalid email format", 400);
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: data.password,
      });

      if (error) {
        rateLimiter.increment(normalizedEmail);
        throw new AppError(error.message, error.status ?? 401);
      }

      rateLimiter.reset(normalizedEmail);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  static async register(data: RegisterFormData) {
    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      // Rate limiting check
      if (rateLimiter.isLimited(normalizedEmail)) {
        throw new AppError(
          "Too many registration attempts. Please try again later.",
          429
        );
      }

      // Email validation
      if (!AUTH.VALIDATION.EMAIL_REGEX.test(normalizedEmail)) {
        throw new AppError("Invalid email format", 400);
      }

      // Password validation
      if (data.password.length < AUTH.VALIDATION.PASSWORD_MIN_LENGTH) {
        throw new AppError(
          `Password must be at least ${AUTH.VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
          400
        );
      }

      if (!AUTH.VALIDATION.PASSWORD_REGEX.test(data.password)) {
        throw new AppError(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          400
        );
      }

      const supabase = await createClient();
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
      });

      if (error) {
        rateLimiter.increment(normalizedEmail);
        throw new AppError(error.message, error.status ?? 401);
      }

      rateLimiter.reset(normalizedEmail);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }
}
