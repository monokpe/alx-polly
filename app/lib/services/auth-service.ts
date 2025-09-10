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
      
      if (error) throw new AppError(error.message);
      return { success: true };
    } catch (error) {
      throw handleError(error);
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
      
      if (error) throw new AppError(error.message);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  }
}
