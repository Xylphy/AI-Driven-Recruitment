import type { FetchCandidateProfileOutput } from "@/types/types";

function getYear(value?: string | Date) {
  return value ? new Date(value).getFullYear() : "N/A";
}

export default function CandidateResume({
  candidateProfile,
}: {
  candidateProfile: FetchCandidateProfileOutput | null | undefined;
}) {
  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-6">
        <span className="text-red-600">Candidate</span> Profile
      </h2>

      <div className="h-[65vh] overflow-y-auto pr-2 space-y-8 text-sm text-gray-800">
        <div className="space-y-1">
          <p>
            <strong>Name:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.name || "N/A"}
          </p>
          <p>
            <strong>Contact:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.contact_number ||
              "N/A"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {candidateProfile?.parsedResume?.raw_output?.email || "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Education
          </h3>
          <div className="bg-white p-4 border rounded">
            {candidateProfile?.parsedResume?.raw_output?.educational_background.map(
              (edu) => (
                <div key={crypto.randomUUID()} className="mb-4">
                  <p>
                    <strong>Degree:</strong> {edu.degree}
                  </p>
                  <p>
                    <strong>Institution:</strong> {edu.institution}
                  </p>
                  <p>
                    <strong>Start:</strong> {getYear(edu.start_date)}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Soft Skills
          </h3>
          <ul className="list-disc ml-6 space-y-1">
            {candidateProfile?.parsedResume?.raw_output?.soft_skills &&
            candidateProfile.parsedResume?.raw_output?.soft_skills.length > 0
              ? candidateProfile.parsedResume.raw_output.soft_skills.map(
                  (skill: string) => <li key={crypto.randomUUID()}>{skill}</li>,
                )
              : null}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Hard Skills
          </h3>
          <ul className="list-disc ml-6 space-y-1 columns-2">
            {candidateProfile?.parsedResume?.raw_output?.hard_skills &&
            candidateProfile.parsedResume.raw_output.hard_skills.length > 0
              ? candidateProfile.parsedResume.raw_output.hard_skills.map(
                  (skill: string) => <li key={crypto.randomUUID()}>{skill}</li>,
                )
              : null}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Work Experience
          </h3>
          <div className="space-y-4">
            {candidateProfile?.parsedResume?.raw_output?.work_experience.map(
              (work) => (
                <div
                  key={crypto.randomUUID()}
                  className="bg-white p-4 border rounded"
                >
                  <p>
                    <strong>Title:</strong> {work.title}
                  </p>
                  <p>
                    <strong>Company:</strong> {work.company}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {work.start_date ? getYear(work.start_date) : "N/A"}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {work.end_date ? getYear(work.end_date) : "Present"}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Projects</h3>
          {candidateProfile?.parsedResume?.raw_output?.projects &&
          candidateProfile.parsedResume?.raw_output.projects?.length > 0 ? (
            candidateProfile.parsedResume?.raw_output.projects.map(
              (project) => (
                <div
                  key={crypto.randomUUID()}
                  className="bg-white p-4 border rounded"
                >
                  <p>
                    <strong>Name:</strong> {project.name}
                  </p>
                  <p>
                    <strong>Start:</strong> {getYear(project.start_date)}
                  </p>
                  <p>
                    <strong>Description:</strong> {project.description}
                  </p>
                </div>
              ),
            )
          ) : (
            <p>No projects listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
