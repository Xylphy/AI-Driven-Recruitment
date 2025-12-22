import type { FetchCandidateProfileOutput } from "@/types/types";

interface WorkExperience {
  company: string;
  start_date?: Date;
  title: string;
  end_date?: Date;
}

interface EducationalBackground {
  degree: string;
  institution: string;
  start_date: Date;
}

interface Project {
  description: string;
  name: string;
  start_date: Date;
}

export default function CandidateResume({
  candidateProfile,
}: {
  candidateProfile: FetchCandidateProfileOutput | null | undefined;
}) {
  return (
    <div className="w-full md:w-2/3 p-6">
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
              (edu: EducationalBackground, index: number) => (
                <div key={index} className="mb-4">
                  <p>
                    <strong>Degree:</strong> {edu.degree}
                  </p>
                  <p>
                    <strong>Institution:</strong> {edu.institution}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(edu.start_date).getFullYear()}
                  </p>
                </div>
              )
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
                  (skill: string, index: number) => <li key={index}>{skill}</li>
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
                  (skill: string, index: number) => <li key={index}>{skill}</li>
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
              (work: WorkExperience, index: number) => (
                <div key={index} className="bg-white p-4 border rounded">
                  <p>
                    <strong>Title:</strong> {work.title}
                  </p>
                  <p>
                    <strong>Company:</strong> {work.company}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {work.start_date
                      ? new Date(work.start_date).getFullYear()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {work.end_date
                      ? new Date(work.end_date).getFullYear()
                      : "Present"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Projects</h3>
          {candidateProfile?.parsedResume?.raw_output?.projects &&
          candidateProfile.parsedResume?.raw_output.projects?.length > 0 ? (
            candidateProfile.parsedResume?.raw_output.projects.map(
              (project: Project, index: number) => (
                <div key={index} className="bg-white p-4 border rounded">
                  <p>
                    <strong>Name:</strong> {project.name}
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(project.start_date).getFullYear()}
                  </p>
                  <p>
                    <strong>Description:</strong> {project.description}
                  </p>
                </div>
              )
            )
          ) : (
            <p>No projects listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
