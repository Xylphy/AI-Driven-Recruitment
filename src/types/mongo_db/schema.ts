import type { ObjectId } from "mongodb";
export type ScoredCandidateScoreData = {
  raw_score: number;
  reason: string;
  predictive_success: number;
  phrases: string[];
  skill_gaps_recommendations: string;
  soft_skill_score: number;
  transcription_score: number;
  transcription_cultural_fit_score: number;
  cultural_fit_score: number;
  job_fit_score: number;
  job_fit_stars: number;
};

export type ScoredCandidateDoc = {
  _id: ObjectId;
  applicant_id: string; // UUID
  job_id: string; // UUID
  score_data: ScoredCandidateScoreData;
};
