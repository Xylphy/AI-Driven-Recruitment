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

export type TranscribedDoc = {
  _id: ObjectId;
  applicant_id: string;
  transcription: {
    transcription: string;
    sentiment_analysis: string;
    sentimental_analysis_phrases: Array<string>;
    personality_traits: string;
    personality_traits_phrases: Array<string>;
    communication_style_insights: string;
    communication_style_insights_phrases: Array<string>;
    interview_insights: string;
    interview_insights_phrases: Array<string>;
    cultural_fit_insights: string;
    cultural_fit_insights_phrases: Array<string>;
  };
};
