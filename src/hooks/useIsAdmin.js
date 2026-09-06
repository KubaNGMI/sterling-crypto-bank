import { useAuth } from "../context/AuthContext";
import { isAdminEmail } from "../config/admins";

export function useIsAdmin() {
  const { user } = useAuth();
  return isAdminEmail(user?.email);
}
