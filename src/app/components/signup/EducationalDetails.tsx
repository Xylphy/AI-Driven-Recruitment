"use client";

import { EducationalDetail } from "@/app/types/types";

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

export default function EducationalDetails({
  update,
  delete: deleteEducationalDetail,
  add,
  getEducationalDetails,
}: {
  update: (id: number, key: string, value: string | boolean) => void;
  delete: (id: number) => void;
  add: () => void;
  getEducationalDetails: EducationalDetail[];
}) {
  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Educational Details</h2>
      {getEducationalDetails.map((box) => (
        <div
          key={box.id}
          className="mb-6 p-4 border rounded-lg shadow-sm space-y-3"
        >
          <input
            type="text"
            value={box.institute}
            onChange={(e) => update(box.id, "institute", e.target.value)}
            placeholder="Institute / School"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            value={box.major}
            onChange={(e) => update(box.id, "major", e.target.value)}
            placeholder="Major / Department"
            className="border border-gray-300 rounded px-2 py-1 w-full"
          />
          <input
            type="text"
            value={box.degree}
            onChange={(e) => update(box.id, "degree", e.target.value)}
            placeholder="Degree"
            className="border border-gray-300 rounded px-2 py-1 w-full"
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
          {!box.currentlyPursuing && (
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
              checked={box.currentlyPursuing || false}
              onChange={(e) =>
                update(box.id, "currentlyPursuing", e.target.checked)
              }
            />
            <label className="text-sm">Currently pursuing</label>
          </div>
          <button
            type="button"
            onClick={() => deleteEducationalDetail(box.id)}
            className="text-red-600 text-sm underline"
          >
            Clear Educational Details
          </button>
        </div>
      ))}
      <p
        onClick={add}
        className="text-green-500 cursor-pointer hover:underline mb-4"
      >
        Add Educational Detail
      </p>
    </div>
  );
}
