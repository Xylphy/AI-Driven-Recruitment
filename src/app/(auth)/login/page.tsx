import type { Metadata } from "next";
import LoginClient from "./Login";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your account",
};

export default function LoginPage() {
  return <LoginClient />;
}
