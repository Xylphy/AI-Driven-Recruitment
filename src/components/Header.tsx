"use client";
import { Bell, Search, User } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 w-full max-w-md bg-gray-100 rounded-lg px-3 py-2">
        <Search className="text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
    </header>
  );
}
