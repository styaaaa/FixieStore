import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { role, loading } = useUserRole();

  if (loading) return <p>Loading...</p>;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}
