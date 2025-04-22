/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
enum ENUM {
  USER_SIGNUP = '/api/v1/auth/signup',
  GET_LIST_OF_INTERESTS = '/api/v1/users/interests',
  SET_USER_INTERESTS = '/api/v1/users/interests',
  VERIFY_OTP='/api/v1/auth/verify-otp',
  SET_USER_PROFILE='/api/v1/users/complete-profile',
  GET_LIST_OF_USERS_TO_FOLLOW='/api/v1/users/list?page=1&limit=20',
  FOLLOW_A_USER='/api/v1/users/follow'
}
export default ENUM;
