"use client";
import React, { useState } from "react";

interface EducationalDetail {
  id: number;
  value: string;
}

interface SocialLinks {
  id: number;
  value: string;
}

export function EducationalDetails() {
  const [educationalDetails, setEducationalDetails] = useState<
    EducationalDetail[]
  >([]);
  const [inputBoxes, setInputBoxes] = useState<EducationalDetail[]>([]);

  const handleAddInputBox = () => {
    const newId = inputBoxes.length + 1;
    setInputBoxes([...inputBoxes, { id: newId, value: "" }]);
  };

  const handleInputChange = (id: number, value: string) => {
    setInputBoxes(
      inputBoxes.map((box) => (box.id === id ? { ...box, value } : box))
    );
  };

  const handleAddDetail = (id: number) => {
    const detail = inputBoxes.find((box) => box.id === id);
    if (detail && detail.value.trim()) {
      setEducationalDetails([
        { id, value: detail.value },
        ...educationalDetails,
      ]);
      setInputBoxes(inputBoxes.filter((box) => box.id !== id));
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Educational Details</h2>
      {inputBoxes.map((box) => (
        <div key={box.id} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={box.value}
            onChange={(e) => handleInputChange(box.id, e.target.value)}
            placeholder="Enter educational detail"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
        </div>
      ))}
      <p
        onClick={handleAddInputBox}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Educational Detail
      </p>
    </div>
  );
}

export function SocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks[]>([]);

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
