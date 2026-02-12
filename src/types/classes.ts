import type {
  EducationalDetail,
  JobExperience,
  SocialLink,
} from "../types/types";

export class EducationalDetailClass implements EducationalDetail {
  id: number;
  institute: string;
  major: string;
  degree: string;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
  currentlyPursuing: boolean;

  constructor(id: number) {
    this.id = id;
    this.endMonth =
      this.startMonth =
      this.degree =
      this.major =
      this.institute =
        "";
    this.startYear = this.endYear = 0;
    this.currentlyPursuing = false;
  }
}

export class JobExperienceClass implements JobExperience {
  id: number;
  title: string;
  company: string;
  summary: string;
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
  currentlyWorking: boolean;

  constructor(id: number) {
    this.id = id;
    this.title =
      this.company =
      this.summary =
      this.startMonth =
      this.endMonth =
        "";
    this.startYear = this.endYear = 0;
    this.currentlyWorking = false;
  }
}

export class SocialLinkClass implements SocialLink {
  id: number;
  value: string;

  constructor(id: number) {
    this.id = id;
    this.value = "";
  }
}

export class ErrorResponse {
  status: number;
  errorMessage: string;

  constructor(status: number, errorMessage: string) {
    this.status = status;
    this.errorMessage = errorMessage;
  }
}
