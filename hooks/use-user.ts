"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import useSWR from "swr";
import type { User } from "@/lib/db/schema";

type UserData = Omit<User, "password">;

const fetcher = async (url: string): Promise<UserData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

/**
 * Hook to fetch and use complete user data from the database.
 * This hook leverages the session email to fetch the full user object.
 *
 * @returns Object containing user data, loading state, error state, and mutate function
 *
 * @example
 * const { user, isLoading, error, mutate } = useUser();
 */
export function useUser() {
  const { data: session, status } = useSession();

  const {
    data: user,
    error,
    mutate,
    isLoading,
  } = useSWR<UserData>(
    // Only fetch if session is authenticated and has an email
    status === "authenticated" && session?.user?.email ? "/api/user" : null,
    fetcher,
    {
      // Revalidate on focus to keep data fresh
      revalidateOnFocus: true,
      // Dedupe requests within 5 seconds
      dedupingInterval: 5000,
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  );

  const userData = useMemo(() => {
    if (!user) {
      return null;
    }
    return user;
  }, [user]);

  return {
    user: userData,
    isLoading: status === "loading" || isLoading,
    isError: error,
    mutate,
  };
}
