import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const userRoles = user?.roles || []; // حالا آرایه است

  
  if (loading) return null; // یا می‌تونی Spinner بزنی

  // بررسی اینکه حداقل یکی از رول‌های کاربر داخل allowedRoles باشه
  const hasAccess = userRoles.some(roles => allowedRoles.includes(roles));
 
  

  if (!hasAccess) {
    return <Navigate to="/erroraccess" replace />;
  }

  return children;
};

export default ProtectedRoute;
