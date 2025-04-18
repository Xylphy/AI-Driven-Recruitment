import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RegisterState } from "../types/types";

const initialState: RegisterState = {
  prefix: "",
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "",
  mobileNumber: "",
  street: "",
  zip: "",
  city: "",
  state_: "",
  country: "",
  jobTitle: "",
  skillSet: "",
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setSignupData(state, action: PayloadAction<RegisterState>) {
      return { ...state, ...action.payload };
    },
    setEmailData(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
  },
});

export const { setSignupData, setEmailData } = registerSlice.actions;

export default registerSlice.reducer;
