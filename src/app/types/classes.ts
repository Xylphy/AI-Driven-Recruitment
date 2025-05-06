import { EducationalDetail, JobExperience, SocialLink } from "../types/types";

export class EducationalDetailClass implements EducationalDetail {
  id: number;
  institute: string;
  major: string;
  degree: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  currentlyPursuing: boolean;

  constructor(id: number) {
    this.id = id;
    this.endYear =
      this.endMonth =
      this.startYear =
      this.startYear =
      this.startMonth =
      this.degree =
      this.major =
      this.institute =
        "";

    this.currentlyPursuing = false;
  }
}

export class JobExperienceClass implements JobExperience {
  id: number;
  title: string;
  company: string;
  summary: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  currentlyWorking: boolean;

  constructor(id: number) {
    this.id = id;
    this.title = this.company = this.summary = "";
    this.startMonth = this.startYear = this.endMonth = this.endYear = "";
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
