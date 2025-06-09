import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";

export function useAuth() {
start_line:5

start_line:5

  const { data: user = null, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
