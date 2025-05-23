"use client";

import { JobExperience } from "@/types/types";

const years = Array.from({ length: 56 }, (_, i) => 1980 + i);

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

export default function JobExperiences({
  update,
  delete: deleteEducationalDetail,
  add,
  getJobExperiences,
}: {
  update: (id: number, key: string, value: string | boolean) => void;
  delete: (id: number) => void;
  add: () => void;
  getJobExperiences: JobExperience[];
}) {
  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Job Experiences</h2>
      {getJobExperiences.map((box) => (
        <div
          key={box.id}
          className="mb-6 p-4 border rounded-lg shadow-sm space-y-3"
        >
          <input
            type="text"
            value={box.title}
            onChange={(e) => update(box.id, "title", e.target.value)}
            placeholder="Title"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            maxLength={255}
          />
          <input
            type="text"
            value={box.company}
            onChange={(e) => update(box.id, "company", e.target.value)}
            placeholder="Company"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            maxLength={255}
          />
          <textarea
            value={box.summary}
            onChange={(e) => update(box.id, "summary", e.target.value)}
            placeholder="Summary"
            className="border border-gray-300 rounded px-2 py-1 w-full h-24 resize-y"
          />
          <p>Duration</p>
          <div className="flex gap-2">
            <select
              value={box.startMonth}
              onChange={(e) => update(box.id, "startMonth", e.target.value)}
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
              onChange={(e) => update(box.id, "startYear", e.target.value)}
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
          {!box.currentlyWorking && (
            <div className="flex gap-2">
              <select
                value={box.endMonth}
                onChange={(e) => update(box.id, "endMonth", e.target.value)}
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
                onChange={(e) => update(box.id, "endYear", e.target.value)}
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
              checked={box.currentlyWorking || false}
              onChange={(e) =>
                update(box.id, "currentlyWorking", e.target.checked)
              }
            />
            <label className="text-sm">Currently working</label>
          </div>
          <button
            type="button"
            onClick={() => deleteEducationalDetail(box.id)}
            className="text-red-600 text-sm underline"
          >
            Clear Job Experience
          </button>
        </div>
      ))}
      <p
        onClick={add}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Job Experiences
      </p>
    </div>
  );
}
