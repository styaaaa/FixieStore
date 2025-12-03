import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfileById,
  type ProfileUpdatePayload,
  type UserProfile,
  upsertProfile,
} from "@/lib/repositories/profileRepository";

export const useUserProfile = (userId?: string) =>
  useQuery<UserProfile | null>({
    queryKey: ["profile", userId],
    queryFn: () => getProfileById(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateUserProfile = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => upsertProfile(userId!, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data);
    },
  });
};
