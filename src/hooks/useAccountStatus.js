import { useProfile } from "./useProfile";

const VERIFIED = "verified";

// The signed-in user's account_status, derived from their profile row. Drives
// the verify gate on trading + Add Funds. A missing profile row reads as
// "unverified".
export function useAccountStatus() {
  const { profile, loading, refetch } = useProfile();
  const status = loading && !profile ? null : profile?.account_status ?? "unverified";

  return {
    status,
    verified: status === VERIFIED,
    loading,
    refetch,
  };
}
