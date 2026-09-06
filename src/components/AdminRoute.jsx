import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdminEmail } from "../config/admins";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminEmail(user.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
