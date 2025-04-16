/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '@/store/userStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  InterestsPayload,
  UserProfilePayload,
  VerifyOtpPayload,
} from '@/types/signup/user';
import { getListOfInterests, setUserInterests, signUpRequest, submitUserProfile, verifyOtp } from '../queries/userAuthQueries';


export const useSignUp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signUpRequest,
    onSuccess: (data: any) => {
      console.log('is data', data);
      if(data?.status_code == 201){
        setUser(data?.data);
        router.push('/otp')
      }
    },
    onError: (error: any) => {
      console.log('sign up error', error)
    }
  });
};

export const useGetListOfInterests = () => {
  return useQuery<string[]>({
    queryKey: ['interests'],
    queryFn: getListOfInterests,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useVerifyOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (data: any) => {
      console.log('verify otp', data)
      if(data?.status_code == 200){
        setUser(data);
        router.push('/profile')
      }
    },
  });
};

export const useSubmitProfile = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: UserProfilePayload) => submitUserProfile(payload),
    onSuccess: (data: any) => {
      if(data?.status_code == 200){
        router.push('/interest')
      }
    }
  });
};

export const useSetUserInterests = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: InterestsPayload) => setUserInterests(payload),
    onSuccess: (data: any) => {
      if(data?.status_code == 200){
        router.push('/account')
      }
    }
  });
};
