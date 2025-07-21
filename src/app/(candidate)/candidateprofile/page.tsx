"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import { useEffect, useState } from "react";
import { JobListing } from "@/types/schema";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const hasTranscript = true;
  const [jobListed, setJobListed] = useState<{
    createdByThem: JobListing[];
    createdByOthers: JobListing[];
  }>({
    createdByThem: [],
    createdByOthers: [],
  });

  const { information, isAuthLoading } = useAuth(true, true);
  const [isEvaluationLoading, setIsEvaluationLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const savedStatus = sessionStorage.getItem("candidateStatus");
    if (savedStatus) {
      setSelectedStatus(savedStatus);
    }
  });

  useEffect(() => {
    const delay = Math.floor(Math.random() * 5000) + 5000;
    const timer = setTimeout(() => {
      setIsEvaluationLoading(false);

      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setProgress(current);
        if (current >= 68) {
          clearInterval(interval);
        }
      }, 15);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const delay = Math.floor(Math.random() * 5000) + 5000;

    const timer = setTimeout(() => {
      setIsEvaluationLoading(false);

      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 1;
        setProgress(currentProgress);
        if (currentProgress >= 68) clearInterval(progressInterval);
      }, 15);

      let currentStars = 0;
      const targetStars = Math.round(3.75);
      const starInterval = setInterval(() => {
        currentStars += 1;
        setStarCount(currentStars);
        if (currentStars >= targetStars) clearInterval(starInterval);
      }, 200);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-white h-[75vh] overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="bg-white rounded-lg max-w-6xl mx-auto h-full flex">
          <div className="w-full md:w-1/3 border-r border-gray-300 p-6 flex flex-col items-center bg-white">
            <label
              htmlFor="profile-upload"
              className="relative inline-block w-40 h-40 rounded-full overflow-hidden cursor-pointer group"
            >
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <Image
                src="/logo.png"
                alt="Profile"
                width={160}
                height={160}
                className="object-cover rounded-full w-full h-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-opacity duration-200">
                <span className="text-white font-medium">Update Picture</span>
              </div>
            </label>

            <h2 className="text-lg font-semibold mt-4 text-center">
              {isAuthLoading ? (
                <div className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              ) : (
                <span>
                  {information.user?.first_name || "No"}{" "}
                  {information.user?.last_name || "Name"}
                </span>
              )}
            </h2>

            <div className="flex gap-3 my-4">
              <MdEmail className="text-red-600" />
              <FaFacebook className="text-red-600" />
              <FaInstagram className="text-red-600" />
              <MdPhone className="text-red-600" />
            </div>
            {information.admin && (
              <div className="mt-4">
                <label
                  htmlFor="status"
                  className="block text-sm text-center font-semibold text-gray-700 mb-1"
                >
                  Candidate Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setSelectedStatus(newStatus);
                    sessionStorage.setItem("candidateStatus", newStatus);
                  }}
                  className="bg-red-600 text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-600 hover:border-red-600 focus:outline-none"
                >
                  <option value="">Select Status</option>
                  <option value="initial">Initial Interview</option>
                  <option value="for-interview">For Interview</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-4 my-4">
              <button
                onClick={() => router.push("/resume")}
                className="bg-[#E30022] text-white font-bold px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
              >
                VIEW CANDIDATE PROFILE
              </button>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6">
            {isEvaluationLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
                <div className="w-full h-32 bg-gray-200 rounded"></div>
                <div className="w-full h-64 bg-gray-200 rounded"></div>
                <p className="text-gray-400 text-sm">
                  Loading candidate evaluation...
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-red-600">Candidate</span> Evaluation
                </h2>
                <div className="h-[65vh] overflow-y-auto space-y-10 pr-2">
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6">
                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-1">
                        Raw Score:
                      </span>
                      <div className="flex items-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 transition-colors duration-300 ${
                              i < starCount
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-600">(3.75/5)</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-1">
                        Predictive Success:
                      </span>
                      <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                        <div
                          className="bg-green-500 h-3 rounded transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 mt-1 block">
                        {progress}% likelihood of success
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-1">
                        Evaluation Summary:
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Based on the resume, the candidate possesses a strong
                        academic background and relevant experience in the
                        field. The transcript reveals a consistent high
                        performance in related coursework, indicating a solid
                        understanding of the core concepts. The sentimental
                        analysis of the application materials suggests a
                        positive and enthusiastic attitude towards the role and
                        the company. Furthermore, the personality traits
                        analysis highlights qualities such as conscientiousness,
                        teamwork, and adaptability, which are highly desirable
                        for this position. Communication style insights indicate
                        clear and concise communication abilities, both written
                        and verbal. While there are no specific interview
                        insights available at this time, the combined
                        information paints a picture of a well-qualified and
                        promising candidate.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6 text-sm text-gray-800">
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Sentiment Analysis
                      </h3>
                      <p>
                        The overall sentiment of the interview is positive and
                        forward-looking, driven by Zing and Glue's enthusiasm
                        for technology's potential impact and their ambition to
                        contribute to world-changing companies. Their
                        communication style is direct and assertive, reflecting
                        confidence in their past accomplishments and future
                        aspirations. The key takeaway is their passion for
                        leveraging technology for social good, coupled with
                        their understanding of the Silicon Valley ethos. This
                        demonstrates a degree of self-awareness and the ability
                        to align personal values with professional goals.
                        Further exploration of their risk assessment and
                        problem-solving approaches are recommended, but their
                        demonstrated soft skills such as initiative,
                        self-direction, and goal orientation are apparent.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Personality Traits
                      </h3>
                      <p>
                        Based on the limited transcript, Zing and Glue displays
                        characteristics suggesting high openness,
                        conscientiousness, and extroversion. Their co-founding
                        of a social enterprise and their move to the Bay Area
                        indicate a willingness to embrace new experiences and a
                        proactive approach to seeking opportunities, which
                        reflects openness. The successful establishment and
                        self-sustainability of their company suggests
                        conscientiousness, implying organization, diligence, and
                        responsibility. Their confident self-introduction and
                        clear articulation of their accomplishments point
                        towards extroversion, indicating comfort in expressing
                        themselves and engaging with others. It's difficult to
                        assess agreeableness and neuroticism without further
                        interaction; however, the focus on 'mission-inspired'
                        work hints at a desire to align with collaborative and
                        meaningful goals.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Communication Style
                      </h3>
                      <p>
                        Zing and Glue exhibits a primarily assertive and direct
                        communication style. They confidently introduce
                        themselves and their accomplishments, demonstrating
                        self-assurance. The language used, such as 'I co-founded
                        an award-winning social enterprise,' and 'Today, this
                        company is self-sustaining,' suggests a directness and a
                        clear articulation of their achievements. There's a
                        noticeable absence of hedging or qualifiers, further
                        reinforcing their assertive communication. Moreover,
                        their statement about Silicon Valley valuing 'smart
                        risk-taking, innovation, and ruthless efficiency'
                        combined with their desire to join a 'mission-inspired'
                        company indicates an ability to communicate their values
                        and expectations clearly. The overall tone suggests
                        confidence and a proactive communication style, aligning
                        with someone who is clear about their goals and
                        motivations.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Interview Insights
                      </h3>

                      {hasTranscript ? (
                        <div>
                          <p>
                            The overall sentiment of the interview is positive
                            and forward-looking, driven by Zing and Glue's
                            enthusiasm for technology's potential impact and
                            their ambition to contribute to world-changing
                            companies. Their communication style is direct and
                            assertive, reflecting confidence in their past
                            accomplishments and future aspirations. The key
                            takeaway is their passion for leveraging technology
                            for social good, coupled with their understanding of
                            the Silicon Valley ethos. This demonstrates a degree
                            of self-awareness and the ability to align personal
                            values with professional goals. Further exploration
                            of their risk assessment and problem-solving
                            approaches are recommended, but their demonstrated
                            soft skills such as initiative, self-direction, and
                            goal orientation are apparent.
                          </p>
                          <details className="bg-white border rounded p-3 mt-3">
                            <summary className="cursor-pointer font-medium text-red-600">
                              View Full Transcription
                            </summary>
                            <p className="mt-2 text-gray-700">
                              "Hi everyone, my name is Zing and Glue and I'm a
                              26-year-old American from Atlanta, Georgia. I've
                              recently arrived in the Bay Area after spending
                              the past three and a half years in China. When
                              2012, I co-founded an award-winning social
                              enterprise to scratch. Using web, mobile and
                              video, my team and I placed hundreds of blue
                              collar workers and good jobs. Today, this company
                              is self-sustaining. I saw with my own eyes the
                              power that technology has to accelerate impact.
                              This is why I'm now here. Because Silicon Valley
                              values smart risk-taking, innovation and ruthless
                              efficiency. I'm looking for a company that's
                              mission-inspired and out to change the world.
                              Because I am too."
                            </p>
                          </details>
                        </div>
                      ) : (
                        <div className="mt-4 border border-dashed border-gray-300 p-4 text-center rounded">
                          <p className="text-gray-500">
                            No transcript uploaded.
                          </p>
                          <button
                            className="bg-[#E30022] text-white font-bold mt-2 px-4 py-2 rounded border border-transparent transition-all duration-300 ease-in-out hover:bg-transparent hover:text-red-500 hover:border-red-500"
                            onClick={() => {}}
                          >
                            Upload Transcript
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
