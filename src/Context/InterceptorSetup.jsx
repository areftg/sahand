import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setupResponseInterceptor } from "../config/api";
import { useAuth } from "./AuthContext";

const InterceptorSetup = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth(); // فقط logout نیازه

  useEffect(() => {
    setupResponseInterceptor(navigate, refresh); // 👈 فقط این خط تغییر کرده
  }, []);

  return null;
};

export default InterceptorSetup;
