export default function JobsPage() {
  const jobs = [
    { title: "Software Engineer", applicants: 12, status: "Open" },
    { title: "Graphic Designer", applicants: 5, status: "Closed" },
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
          {jobs.map((job, i) => (
            <tr key={i} className="border-t hover:bg-gray-50 transition">
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
