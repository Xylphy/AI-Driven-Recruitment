import type { ObjectId } from "mongodb";
export type ScoredCandidateScoreData = {
  raw_score: number;
  reason: string;
  predictive_success: number;
  phrases: string[];
  skill_gaps_recommendations: string;
};

export type ScoredCandidateDoc = {
  _id: ObjectId;
  user_id: string; // UUID
  job_id: string; // UUID
  score_data: ScoredCandidateScoreData;
  overall_score?: number; // optional since it may not exist in the stored doc
};
