"use client";
import React, { useState } from "react";

interface EducationalDetail {
  id: number;
  value: string;
  institute?: string;
  major?: string;
  degree?: string;
  duration?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  currentlyPursuing?: boolean;
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
    setInputBoxes([
      ...inputBoxes,
      {
        id: newId,
        value: "",
        institute: "",
        major: "",
        degree: "",
        duration: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        currentlyPursuing: false,
      },
    ]);
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

  const handleClear = (id: number) => {
    setInputBoxes((prev) => prev.filter((box) => box.id !== id));
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 56 }, (_, i) => 1980 + i);

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Educational Details</h2>
      {inputBoxes.map((box) => (
        <div
          key={box.id}
          className="mb-6 p-4 border rounded-lg shadow-sm space-y-3"
        >
          <input
            type="text"
            value={box.institute}
            onChange={(e) => handleInputChange(box.id, "institute")}
            placeholder="Institute / School"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            value={box.major}
            onChange={(e) => handleInputChange(box.id, "major")}
            placeholder="Major / Department"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            value={box.degree}
            onChange={(e) => handleInputChange(box.id, "degree")}
            placeholder="Degree"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <p onChange={(e) => handleInputChange(box.id, "duration")}>
            Duration
          </p>
          <div className="flex gap-2">
            <select
              value={box.startMonth}
              onChange={(e) => handleInputChange(box.id, "startMonth")}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            >
              <option value="">Start Month</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={box.startYear}
              onChange={(e) => handleInputChange(box.id, "startYear")}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            >
              <option value="">Start Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {!box.currentlyPursuing && (
            <div className="flex gap-2">
              <select
                value={box.endMonth}
                onChange={(e) => handleInputChange(box.id, "endMonth")}
                className="border border-gray-300 rounded px-2 py-1 w-full"
              >
                <option value="">End Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={box.endYear}
                onChange={(e) => handleInputChange(box.id, "endYear")}
                className="border border-gray-300 rounded px-2 py-1 w-full"
              >
                <option value="">End Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={box.currentlyPursuing || false}
              onChange={(e) => handleInputChange(box.id, "currentlyPursuing")}
            />
            <label className="text-sm">Currently pursuing</label>
          </div>
          <button
            type="button"
            onClick={() => handleClear(box.id)}
            className="text-red-600 text-sm underline"
          >
            Clear Educational Details
          </button>
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
