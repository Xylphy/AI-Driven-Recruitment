"use client";
import React, { useState } from "react";

export function EducationalDetails() {
  const [educationalDetails, setEducationalDetails] = useState<string[]>([]);
  const [newDetail, setNewDetail] = useState<string>("");

  const handleAddDetail = () => {
    if (newDetail.trim()) {
      setEducationalDetails([newDetail, ...educationalDetails]);
      setNewDetail("");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Educational Details</h2>
      {newDetail !== "" && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newDetail}
            onChange={(e) => setNewDetail(e.target.value)}
            placeholder="Enter educational detail"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <button
            onClick={handleAddDetail}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      )}
      <p
        onClick={() => setNewDetail("")}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Educational Detail
      </p>
      <ul className="list-disc pl-5">
        {educationalDetails.map((detail, index) => (
          <li key={index} className="text-gray-700">
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SocialLinks() {
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState<string>("");

  const handleAddLink = () => {
    if (newLink.trim()) {
      setSocialLinks([newLink, ...socialLinks]);
      setNewLink("");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Social Links</h2>
      {newLink !== "" && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Enter social link"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <button
            onClick={handleAddLink}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      )}
      <p
        onClick={() => setNewLink("")}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Social Link
      </p>
      <ul className="list-disc pl-5">
        {socialLinks.map((link, index) => (
          <li key={index} className="text-gray-700">
            {link}
          </li>
        ))}
      </ul>
    </div>
  );
}
