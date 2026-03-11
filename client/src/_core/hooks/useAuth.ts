type UseAuthOptions = {
  // kept for future compatibility; ignored in mock auth
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Simple mock auth: always treated as logged in locally.
export function useAuth(_options?: UseAuthOptions) {
  return {
    user: { name: "Veridia User" },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: async () => {},
    logout: async () => {},
  };
}
