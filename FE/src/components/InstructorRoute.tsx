import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.roles?.includes('instructor')) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default InstructorRoute;
