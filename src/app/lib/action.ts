"use server";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Authenticate with supabase here
}

export async function signup(formData: FormData) {
  console.log("formData", formData);
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const mobileNumber = formData.get('mobileNumber');
  const password = 'jamesacabal';
  const obj = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    mobileNumber: mobileNumber,
    password: password
  };

  const {data, error} = await supabase
    .from('tbluser')
    .insert([obj]);
  if(error){
    console.log('Error: ' + error);
  } else{
    console.log('Data: ' + data);
  }
 
}
