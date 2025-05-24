"use client";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const { information, isAuthLoading, isAuthenticated } = useAuth();

  return <p>Hellooo </p>;
}
