"use client";

import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const jobs = [
    {
      title: "Web Developer",
      applicants: 1,
      status: "Open",
      id: "4096b1dc-13d1-4a10-b499-b0e2684dfa31",
    },
    {
      title: "Some random job",
      applicants: 0,
      status: "Open",
      id: "7d8a2d72-432f-40a5-899d-5d93086afb0e",
    },
    {
      title: "Test title",
      applicants: 0,
      status: "Open",
      id: "9721e964-67ca-42ad-9542-2c2d893e498e",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-red-600">Job Listings</h2>
      <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-4 font-semibold">Job Title</th>
            <th className="p-4 font-semibold">Applicants</th>
            <th className="p-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-t hover:bg-gray-50 transition cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/joblisting/${job.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/joblisting/${job.id}`);
                }
              }}
            >
              <td className="p-4">{job.title}</td>
              <td className="p-4">{job.applicants}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
