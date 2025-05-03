"use client";
import React, { useState } from "react";

interface SocialLink {
  id: number;
  value: string;
}

export default function SocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const handleAddLink = () => {
    const newId = socialLinks.length + 1;
    setSocialLinks([...socialLinks, { id: newId, value: "" }]);
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Social Links</h2>
      {socialLinks.map((link) => (
        <div key={link.id} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={link.value}
            onChange={(e) =>
              setSocialLinks(
                socialLinks.map((l) =>
                  l.id === link.id ? { ...l, value: e.target.value } : l
                )
              )
            }
            placeholder="Enter social link"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
      ))}
      <p
        onClick={handleAddLink}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Social Link
      </p>
    </div>
  );
}
