import { createClient } from "@/lib/supabase/server";
import { LoginFormData, RegisterFormData } from "../types";
import { AppError, handleError } from "../utils/error-utils";
import { rateLimiter } from "../utils/rate-limiter";
import { AUTH } from "../config/constants";

export class AuthService {
  static async login(data: LoginFormData) {
    try {
      // Rate limiting check
      if (rateLimiter.isLimited(data.email)) {
        throw new AppError("Too many login attempts. Please try again later.", 429);
      }
      
      // Email validation
      if (!AUTH.VALIDATION.EMAIL_REGEX.test(data.email)) {
        throw new AppError("Invalid email format");
      }
      
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const msg = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : JSON.stringify(error);
        throw new AppError(`Supabase signIn error: ${msg}`);
      }
      return { success: true };
    } catch (error) {
      // Normalize error via handleError then always throw an Error instance (AppError)
      const normalized = handleError(error);
      const message = normalized && (normalized as any).error ? (normalized as any).error : JSON.stringify(normalized);
      const status = (normalized && (normalized as any).statusCode) || 500;
      throw new AppError(message, status);
    }
  }
  
  static async register(data: RegisterFormData) {
    try {
      // Email validation
      if (!AUTH.VALIDATION.EMAIL_REGEX.test(data.email)) {
        throw new AppError("Invalid email format");
      }
      
      // Password validation
      if (data.password.length < AUTH.VALIDATION.PASSWORD_MIN_LENGTH) {
        throw new AppError(`Password must be at least ${AUTH.VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
      }
      
      const supabase = await createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        const msg = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : JSON.stringify(error);
        throw new AppError(`Supabase signUp error: ${msg}`);
      }
      return { success: true };
    } catch (error) {
      // Normalize then throw an Error instance so callers always get an Error
      const normalized = handleError(error);
      const message = normalized && (normalized as any).error ? (normalized as any).error : JSON.stringify(normalized);
      const status = (normalized && (normalized as any).statusCode) || 500;
      throw new AppError(message, status);
    }
  }
}
