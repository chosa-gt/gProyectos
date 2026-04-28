import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface Props {
  children: React.ReactNode;
  requiredRol?: number;
}

export const ProtectedRoute = ({ children, requiredRol }: Props) => {
  const { isAuthenticated, usuario } = useAuthStore();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (requiredRol && usuario?.id_rol !== requiredRol)
    return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};