import { Outlet, Navigate } from "react-router-dom";
import Signin from "pages/Signin";

const tokenExpireInHour = 8;
const ROLES = {
  user: "user",
  admin: "admin",
};

const validateToken = () => {
  return localStorage.getItem("token");
};

const validTime = () => {
  const loginTime = new Date(localStorage.getItem("loginTime"));
  const now = new Date();
  if (!((now - loginTime) / (1000 * 60 * 60) <= tokenExpireInHour))
    localStorage.clear();
  return (now - loginTime) / (1000 * 60 * 60) <= tokenExpireInHour;
};

const validateAdmin = () => {
  const roles = localStorage.getItem("role");
  return (roles && roles == ROLES.admin) || "ADMIN";
};

function ProtectedRoutes() {
  return validateToken() && validTime() ? <Outlet /> : <Signin />;
}

function AdminRoutes() {
  return validateAdmin() && validateToken() ? <Outlet /> : <Signin />;
}

export { ProtectedRoutes, AdminRoutes };
