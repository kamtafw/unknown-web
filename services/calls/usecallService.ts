// import { useQuery } from "@tanstack/react-query";
// import { callKeys, getUserFollowings } from "./callQueries";

// // Get user followings as contacts
// export const useGetCallContacts = () => {
//   return useQuery({
//     queryKey: callKeys.contacts(),
//     queryFn: getUserFollowings,
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//     refetchOnWindowFocus: false,
//   });
// };

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstanceAuthenticated from "@/lib/api/axiosInstance";
import { useAuthStore } from "@/store/userStore";
import { useCallStore } from "@/store/callStore";
import { getSocket } from "./socketService";
import { callKeys, getUserFollowings } from "./callQueries";

interface InitiateCallData {
  recipientId: string;
  callType: "audio" | "video";
}

export const useGetCallContacts = () => {
  return useQuery({
    queryKey: callKeys.contacts(),
    queryFn: getUserFollowings,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useInitiateCall = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setActiveCall = useCallStore((state) => state.setActiveCall);
//   const setParticipants = useCallStore((state) => state.setParticipants);

  return useMutation({
    mutationFn: async (data: InitiateCallData) => {
      if (!user) throw new Error("User not authenticated");

      const response = await axiosInstanceAuthenticated.post(
        "/calls/initiate",
        {
          ...data,
          callerId: user.id,
          callerName: `${user.first_name} ${user.last_name}`,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      const socket = getSocket();

      // Emit call signal to recipient
      socket?.emit("call:initiate", {
        callId: data.callId,
        recipientId: variables.recipientId,
        callType: variables.callType,
        caller: {
          id: user?.id,
          name: `${user?.first_name} ${user?.last_name}`,
        },
      });

      // Set call state
      setActiveCall(data.callId, variables.callType, false);

      queryClient.invalidateQueries({ queryKey: callKeys.active() });
    },
  });
};

export const useAnswerCall = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (callId: string) => {
      const response = await axiosInstanceAuthenticated.post(
        `/calls/${callId}/answer`,
        {
          userId: user?.id,
          userName: `${user?.first_name} ${user?.last_name}`,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callKeys.active() });
    },
  });
};
