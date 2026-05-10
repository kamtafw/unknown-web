import axiosIstanceAuthenticated from "../../lib/api/axiosInstance";

// Report Problem - NEEDS TOKEN
export const reportProblem = async (payload: {
  problem_type: string;
  feedback?: string;
}) => {

  const response = await axiosIstanceAuthenticated.post(
    "/users/report-problem",
    payload
  );
  return response.data;
};

// Change Phone Number - NEEDS TOKEN
export const changePhoneNumber = async (payload: {
  old_number: string;
  new_number: string;
  otp?: string;
}) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/change-phone-number",
    payload
  );
  return response.data;
};

// Confirm Password - NEEDS TOKEN
export const confirmPassword = async (payload: { password: string }) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/confirm-password",
    payload
  );
  return response.data;
};

// Get Current Timezone - NEEDS TOKEN
export const getCurrentTimezone = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/timezone/preferences"
  );
  return response.data;
};

// Get Available Timezones - NEEDS TOKEN
export const getAvailableTimezones = async (locale: string = "en") => {
  const response = await axiosIstanceAuthenticated.get(
    `/users/timezone/list-available?locale=${locale}`
  );
  return response.data;
};

// Change Timezone - NEEDS TOKEN
export const changeTimezone = async (payload: { timezone: string }) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/timezone/change",
    payload
  );
  return response.data;
};