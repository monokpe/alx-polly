"use server";

import { LoginFormData, RegisterFormData } from "../types";
import { AuthService } from "../services/auth-service";
import { createClient } from "@/lib/supabase/server";

export async function login(data: LoginFormData) {
  try {
    const result = await AuthService.login(data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function register(data: RegisterFormData) {
  try {
    const result = await AuthService.register(data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
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

