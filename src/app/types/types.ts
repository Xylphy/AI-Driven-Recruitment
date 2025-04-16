export interface RegisterState {
  prefix: string;
  firstName: string;
  lastName: string;
  email?: string;
  countryCode: string;
  mobileNumber: string;
  street: string;
  zip: string;
  city: string;
  state_: string;
  country: string;
  jobTitle: string;
  skillSet: string;
  success: boolean;
  error: string | null;
}
