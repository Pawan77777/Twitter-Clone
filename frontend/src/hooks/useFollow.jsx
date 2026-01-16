import React from 'react'
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFollow = () => {
  const queryClient=useQueryClient();
  const {mutate:follow,isPending}=useMutation({
    mutationFn:async(userId)=>{
        try {
            const res=await fetch(`/api/users/follow/${userId}`,{
            method:"POST",
        });
        const data=await res.json();
        if(!res.ok){
            throw new Error(data.error || "Failed to follow user");
        }
        return data;
        }
        catch(error){
            throw new Error(error.message || "Something went wrong");
        }
    },
    onSuccess:()=>{
        Promise.all([
            queryClient.invalidateQueries({queryKey:["userProfile"]}),
            queryClient.invalidateQueries({queryKey:["authUser"]}),
            queryClient.invalidateQueries({queryKey:["suggestedUsers"]}),
        ])
        // toast.success("User followed/unfollowed successfully");
        
    },
    onError:(error)=>{
        toast.error(error.message || "Failed to follow user");
    }
  })
  return {follow,isPending};
}

export default useFollow;