/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
enum ENUM {
  USER_SIGNUP = '/api/v1/auth/signup',
  GET_LIST_OF_INTERESTS = '/api/v1/users/interests',
  SET_USER_INTERESTS = '/api/v1/users/interests',
  VERIFY_OTP='/api/v1/auth/verify-otp',
  SET_USER_PROFILE='/api/v1/users/complete-profile'
}
export default ENUM;
