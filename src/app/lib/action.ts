"use server";

import { createClient } from "@supabase/supabase-js";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Authenticate with supabase here
}

export async function signup(formData: FormData) {
  console.log("formData", formData);
  
}
