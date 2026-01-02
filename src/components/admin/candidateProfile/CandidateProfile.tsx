import type { FetchCandidateProfileOutput } from "@/types/types";

export default function CandidateProfile({
  candidateProfile,
}: {
  candidateProfile: FetchCandidateProfileOutput | null | undefined;
}) {
  return (
    <>
      <div className="w-full p-6">
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
                    className={`w-5 h-5 ${
                      i <
                      Math.floor(
                        candidateProfile?.score?.score_data.raw_score || 0
                      )
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.184 3.642a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.087 2.243a1 1 0 00-.364 1.118l1.184 3.642c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.087 2.243c-.785.57-1.84-.197-1.54-1.118l1.184-3.642a1 1 0 00-.364-1.118L3.106 9.07c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.184-3.642z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600">
                  ({candidateProfile?.score?.score_data?.raw_score || 0}/5)
                </span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Predictive Success:
              </span>
              <div className="w-full bg-gray-200 h-3 rounded">
                <div
                  className="bg-green-500 h-3 rounded"
                  style={{
                    width: `${
                      candidateProfile?.score?.score_data?.predictive_success ??
                      0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-1 block">
                {candidateProfile?.score?.score_data.predictive_success || 0}%
                likelihood of success
              </span>
            </div>

            <div className="mt-2">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Key Highlights:
              </span>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {candidateProfile?.score?.score_data.phrases.map(
                  (phrase: string, idx: number) => (
                    <li key={idx}>{phrase}</li>
                  )
                )}
              </ul>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Evaluation Summary:
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {candidateProfile?.score?.score_data.reason}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm space-y-6 text-sm text-gray-800">
            <div>
              <h3 className="font-semibold text-gray-700">
                Sentiment Analysis
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.sentimental_analysis || "No sentiment analysis available."}
              </p>
              <h3 className="font-semibold text-gray-700 mb-2 mt-2">
                Sentiment Analysis Highlights
              </h3>
              {candidateProfile?.transcribed?.transcription
                ?.sentimental_analysis_phrases && (
                <ul className="list-disc ml-6 mt-1">
                  {candidateProfile.transcribed.transcription.sentimental_analysis_phrases.map(
                    (phrase: string, idx: number) => (
                      <li key={idx}>{phrase}</li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Personality Traits
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.personality_traits ||
                  "No personality traits insights available."}
              </p>
              <h3 className="font-semibold text-gray-700 mb-2 mt-2">
                Personality Traits Highlights
              </h3>
              {candidateProfile?.transcribed?.transcription
                ?.personality_traits_phrases && (
                <ul className="list-disc ml-6 mt-1">
                  {candidateProfile.transcribed.transcription.personality_traits_phrases.map(
                    (trait: string, idx: number) => (
                      <li key={idx}>{trait}</li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Communication Style
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.communication_style_insights ||
                  "No communication style insights available."}
              </p>
              <h3 className="font-semibold text-gray-700 mb-2 mt-2">
                Communication Style Highlights
              </h3>
              {candidateProfile?.transcribed?.transcription
                ?.communication_style_insights_phrases && (
                <ul className="list-disc ml-6 mt-1">
                  {candidateProfile.transcribed.transcription.communication_style_insights_phrases.map(
                    (insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Interview Insights
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.interview_insights || "No interview insights available."}
              </p>
              <h3 className="font-semibold text-gray-700 mb-2 mt-2">
                Interview Highlights
              </h3>
              {candidateProfile?.transcribed?.transcription
                ?.interview_insights_phrases && (
                <ul className="list-disc ml-6 mt-1">
                  {candidateProfile.transcribed.transcription.interview_insights_phrases.map(
                    (insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Cultural Fit Insights
              </h3>
              <p>
                {candidateProfile?.transcribed?.transcription
                  ?.cultural_fit_insights ||
                  "No cultural fit insights available."}
              </p>
              <h3 className="font-semibold text-gray-700 mb-2 mt-2">
                Cultural Fit Highlights
              </h3>
              {candidateProfile?.transcribed?.transcription
                ?.cultural_fit_insights_phrases && (
                <ul className="list-disc ml-6 mt-1">
                  {candidateProfile.transcribed.transcription.cultural_fit_insights_phrases.map(
                    (insight: string, idx: number) => (
                      <li key={idx}>{insight}</li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                Skill Gaps Recommendations
              </h3>
              <p>
                {candidateProfile?.score?.score_data
                  ?.skill_gaps_recommendations ||
                  "No skill gaps recommendations available."}
              </p>
            </div>

            <details className="bg-white border rounded p-3">
              <summary className="cursor-pointer font-medium text-red-600">
                View Full Transcription
              </summary>
              <p className="mt-2 text-gray-700">
                {candidateProfile?.transcribed?.transcription?.transcription ||
                  "No transcription available."}
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
