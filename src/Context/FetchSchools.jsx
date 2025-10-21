// import { useEffect } from 'react';
// import axios from 'axios';
// import api,{ endpoints , setAuthToken,setupResponseInterceptor } from '../config/api.js'; // مسیر صحیح فایل endpoints
// import { useAuth } from './AuthContext';
// import { useNavigate } from "react-router-dom";

// function FetchSchools() {
//   const { user,getSchools } = useAuth();
//   const { setUser } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSchools = async () => {
//       try {
//         const response = await api.get(endpoints.schools);
//         console.log("thattttttttt",api.defaults.headers)
//         console.log("✅ لیست مدارس:", response);
//         console.log("thisssssssss", user.token)
        
//       } catch (error) {
//         console.error("❌ خطا در گرفتن مدارس:", error);
//       }
//     };

//     if (user?.token) {
//       fetchSchools();
//     }
//   }, [user]);

//   return null; // یا هر UI که بخوای
// }

// export default FetchSchools;
