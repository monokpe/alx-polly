"use server";

import { LoginFormData, RegisterFormData } from "../types";
import { AuthService } from "../services/auth-service";
import { createClient } from "@/lib/supabase/server";

export async function login(data: LoginFormData) {
  try {
    const result = await AuthService.login(data);
    return { success: true };
  } catch (error: any) {
    return {
      error: {
        message: error.message || "An error occurred during login",
        code: error.code || "AUTH_LOGIN_ERROR",
        statusCode: error.statusCode || 500,
      },
    };
  }
}

export async function register(data: RegisterFormData) {
  try {
    const result = await AuthService.register(data);
    return { success: true };
  } catch (error: any) {
    return {
      error: {
        message: error.message || "An error occurred during registration",
        code: error.code || "AUTH_REGISTER_ERROR",
        statusCode: error.statusCode || 500,
      },
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return {
      error: {
        message: error.message || "An error occurred during logout",
        code: error.code || "AUTH_LOGOUT_ERROR",
        // Map Supabase error status to HTTP status code
        statusCode: error.status || 500,
      },
    };
  }
  return { success: true };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
