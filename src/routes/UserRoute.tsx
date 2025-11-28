import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export default function UserRoute({ children }: { children: JSX.Element }) {
  const { user, authLoading } = useAuth();

   if (authLoading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
