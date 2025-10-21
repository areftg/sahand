import { useEffect } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import { setAuthToken } from "../config/api";


function Token() {
const { user } = useAuth();
  
useEffect(() => {
  if (user?.token) {
    setAuthToken(user.token); // ست کردن توکن در هدر
  }
}, [user]);

}
export default Token;