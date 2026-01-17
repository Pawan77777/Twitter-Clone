import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await fetch("/api/users/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile/cover image");
        }
        return data;
      } catch (error) {
        throw new Error(error.message || "Something went wrong");
      }
    },
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(["authUser"], updatedUser);

      queryClient.setQueryData(
        ["profileUser", updatedUser.userName],
        updatedUser,
      );
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
