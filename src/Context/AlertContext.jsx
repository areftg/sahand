import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api, { endpoints } from '../config/api';
import { useAuth } from './AuthContext'; // ✨ 1. هوک مربوط به احراز هویت را وارد کنید

// ایجاد Context
const AlertContext = createContext();

// هوک سفارشی برای استفاده آسان
export const useAlerts = () => useContext(AlertContext);

// کامپوننت Provider
export const AlertProvider = ({ children }) => {
    // ✨ 2. وضعیت کاربر را از AuthContext دریافت کنید
    // فرض می‌کنیم AuthContext شما یک آبجکت 'user' فراهم می‌کند که در صورت لاگین نبودن، null است
    const { user } = useAuth();

    const [timeSlots, setTimeSlots] = useState([]);
    // مقدار اولیه loading را false قرار می‌دهیم تا بیهوده حالت لودینگ نمایش داده نشود
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState({ message: null, sourceId: null });

    // تابع اصلی برای دریافت داده‌ها از سرور (بدون تغییر)
    const fetchTimeSlots = useCallback(async () => {
        if(user){
         if(user?.roles[0] !== 'parent'){
            console.log('User is not a parent');
             setLoading(true);
        setError({ message: null, sourceId: null });
        try {
            const token = localStorage.getItem("token");
    
            const response = await api.get(endpoints.timeslot(), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            const fetchedData = Array.isArray(response.data.data) ? response.data.data : [];
            const sortedData = [...fetchedData].sort(
                (a, b) => a.start_time.localeCompare(b.start_time)
            );
            setTimeSlots(sortedData);
        } catch (err) {
            const serverMessage = err.response?.data?.message || "خطا در دریافت اطلاعات زنگ‌ها";
            // اگر خطای 401 بود، پیغام را نمایش نده چون کاربر هنوز لاگین نکرده
            if (err.response?.status !== 401) {
                setError({ message: serverMessage, sourceId: null });
            }
        } finally {
            setLoading(false);
        }
       }else{
           setError({ message: 'اولیا', sourceId: null });
           console.log('User is a parent');
       }
        }
    }, [user]);

    // ✨ 3. این useEffect اکنون به وضعیت 'user' وابسته است
    useEffect(() => {
        // فقط زمانی داده‌ها را فراخوانی کن که کاربر لاگین کرده باشد
        if (user) {
            if (user?.roles[0] !== 'parent') {
                if (user.school_id) {
                    fetchTimeSlots();
                }
          }
        } else {
            // اگر کاربر لاگین نکرده یا از سیستم خارج شده، داده‌ها را پاک کن
            setTimeSlots([]);
            setError({ message: null, sourceId: null });
        }
    }, [user, fetchTimeSlots]); // این افکت با تغییر وضعیت کاربر، دوباره اجرا می‌شود

    // مقادیری که در اختیار کامپوننت‌های فرزند قرار می‌گیرد
    const value = {
        timeSlots,
        loading,
        error,
        refetch: fetchTimeSlots,
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};