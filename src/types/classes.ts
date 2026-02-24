import type { SocialLink } from "../types/types";

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
