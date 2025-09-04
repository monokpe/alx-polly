// Simple in-memory rate limiter (for demonstration only)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per window per IP/email

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (entry) {
    if (now - entry.last > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(key, { count: 1, last: now });
      return false;
    }
    if (entry.count >= RATE_LIMIT_MAX) {
      return true;
    }
    entry.count++;
    entry.last = now;
    rateLimitMap.set(key, entry);
    return false;
  } else {
    rateLimitMap.set(key, { count: 1, last: now });
    return false;
  }
}
("use server");

import { createClient } from "@/lib/supabase/server";
import { LoginFormData, RegisterFormData } from "../types";

export async function login(data: LoginFormData) {
  // Rate limiting by email (for demo; in production use IP or a distributed store)
  if (isRateLimited(data.email)) {
    return { error: "Too many login attempts. Please try again later." };
  }

  // CAPTCHA placeholder: verify CAPTCHA token here if implemented
  // if (!verifyCaptcha(data.captchaToken)) {
  //   return { error: "CAPTCHA verification failed." };
  // }
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  // Input validation and sanitization
  const email = (data.email || "").trim().toLowerCase();
  const name = (data.name || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Invalid email address." };
  }
  if (name.length < 2 || name.length > 50) {
    return { error: "Name must be between 2 and 50 characters." };
  }
  // Optionally escape name to prevent injection (basic)
  const safeName = name.replace(/[<>"'`]/g, "");
  // Rate limiting by email (for demo; in production use IP or a distributed store)
  if (isRateLimited(data.email)) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  // CAPTCHA placeholder: verify CAPTCHA token here if implemented
  // if (!verifyCaptcha(data.captchaToken)) {
  //   return { error: "CAPTCHA verification failed." };
  // }
  // Password strength validation
  const password = data.password;
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPassword.test(password)) {
    return {
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        name: safeName,
      },
    },
  });
  if (error) {
    return { error: error.message };
  }
  // Success: no error
  return { error: null };
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
