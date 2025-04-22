/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosIstanceAuthenticated, {
  axiosIsntanceAuth,
} from '@/lib/api/axiosInstance';
import {
  FollowAUser,
  InterestsPayload,
  SignupPayload,
  UserProfilePayload,
  VerifyOtpPayload,
} from '@/types/signup/user';
import ENUM from '../enum';

export const signUpRequest = async (payload: SignupPayload) => {
  try {
    const response: any = await axiosIsntanceAuth.post(
      ENUM.USER_SIGNUP,
      payload
    );
    if (response?.data?.status_code == 201) {
      return response?.data;
    }
    return [];
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

// Signup successful, OTP has been sent to your email for verification.
export const getListOfInterests = async () => {
  try {
    const response = await axiosIstanceAuthenticated.get(
      ENUM.GET_LIST_OF_INTERESTS
    );
    console.log('response', response?.data?.data);
    if (response?.data?.status_code == 200) {
      return response?.data?.data?.interests;
    }
    return [];
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  try {
    const response = await axiosIsntanceAuth.post(ENUM.VERIFY_OTP, payload);

    if (response?.data?.status_code == 200) {
      return response?.data;
    }
    return [];
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const submitUserProfile = async (payload: UserProfilePayload) => {
  try {
    const response = await axiosIstanceAuthenticated.post(
      ENUM.SET_USER_PROFILE,
      payload
    );
    if (response?.data?.status_code == 200) {
      return response?.data;
    }
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const setUserInterests = async (payload: InterestsPayload) => {
  try {
    const resp = await axiosIstanceAuthenticated.post(
      ENUM.SET_USER_INTERESTS,
      payload
    );
    if (resp?.data?.status_code == 200) {
      return resp?.data;
    }
    return [];
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const getListOfUsersToFollow = async () => {
  try {
    const resp = await axiosIstanceAuthenticated.get(
      ENUM.GET_LIST_OF_USERS_TO_FOLLOW
    );
    if (resp?.data?.status_code == 200) {
      return resp?.data;
    }
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const followAUser = async (payload: FollowAUser) => {
  try {
    const resp = await axiosIstanceAuthenticated.post(
      ENUM.FOLLOW_A_USER,
      payload
    );
    console.log('resp', resp);
    if(resp?.status == 201){
      return resp?.data
    }
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

// interests
