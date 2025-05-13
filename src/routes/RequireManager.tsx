import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireManager() {
  const { role } = useAuth();
  return role === "manager" ? <Outlet /> : <Navigate to="/" replace />;
}
