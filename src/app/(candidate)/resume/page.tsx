"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  const { information, isAuthLoading } = useAuth(true, true);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const savedStatus = sessionStorage.getItem("candidateStatus");
    if (savedStatus) {
      setSelectedStatus(savedStatus);
    }
  });

}
