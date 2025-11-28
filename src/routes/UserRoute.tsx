import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export default function UserRoute({ children }: { children: JSX.Element }) {
  const { role, loading } = useUserRole();

  if (loading) return <p>Loading...</p>;
  if (!role) return <Navigate to="/login" replace />;

  return children;
}
