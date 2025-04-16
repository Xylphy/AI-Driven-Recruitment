"use client";

import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export async function completeSignup() {
  const email = useSelector((state: RootState) => state.registerData.email);
  if ()

}
