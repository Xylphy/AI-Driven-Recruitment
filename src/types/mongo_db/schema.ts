import type { ObjectId } from "mongodb";
export type ScoredCandidateScoreData = {
  reason: string;
  phrases: string[];
  skill_gaps_recommendations: string;
  soft_skills_score: number;
  transcription_score: number;
  transcription_cultural_fit_score: number;
  cultural_fit_score: number;
  response_time: number;
  job_fit_score: number;
  job_fit_stars: number;
};

export type ScoredCandidateDoc = {
  _id: ObjectId;
  applicant_id: string; // UUID
  job_id: string; // UUID
  score_data: ScoredCandidateScoreData;
  created_at: number; // Unix timestamp
};
