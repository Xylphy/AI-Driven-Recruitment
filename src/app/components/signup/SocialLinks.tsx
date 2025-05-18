"use client";
import React from "react";
import { SocialLink } from "@/app/types/types";

export default function SocialLinks({
  update,
  delete: deleteLink,
  add,
  getSocialLinks,
}: {
  update: (id: number, value: string) => void;
  delete: (id: number) => void;
  add: () => void;
  getSocialLinks: SocialLink[];
}) {
  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Social Links</h2>
      {getSocialLinks.map((link) => (
        <div key={link.id} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={link.value}
            onChange={(e) => update(link.id, e.target.value)}
            placeholder="Enter social link"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            required
          />
          <button
            onClick={() => deleteLink(link.id)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
      <p
        onClick={add}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Social Link
      </p>
    </div>
  );
}
