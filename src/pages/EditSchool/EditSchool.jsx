// EditSchool.js

import React, { useState, useEffect, useRef } from 'react';
import style from "./EditSchool.module.css";
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import AboutSchool from '../../components/AboutSchool/AboutSchool';
import card from "../../assets/icons/name.svg"
import profile from "../../assets/icons/Profile.svg"

// ۱. انتقال هوک‌ها و نیازمندی‌های API به کامپوننت پدر
import api, { endpoints } from "../../config/api";
import { useAuth } from '../../Context/AuthContext';

// --- هوک useDebounce را مستقیماً به اینجا منتقل می‌کنیم ---
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedCallback;
};
// --------------------------------------------------------

export default function EditSchool() {
  const { user } = useAuth();
  
  // ۲. استیت formData به اینجا منتقل می‌شود
  const [formData, setFormData] = useState({
    name: '',
    orgId: '',
    phone1: '',
    phone2: '',
    phone3: '',
    address: ''
  });
  
  const isInitialMount = useRef(true);
const [initialData, setInitialData] = useState(null);
  // ۳. منطق دریافت دیتا از سرور (Fetch) به اینجا منتقل می‌شود
useEffect(() => {
  const fetchSchoolProfile = async () => {
    try {
      console.log("Fetching school profile from EditSchool component...");
      const response = await api.get(endpoints.schoolprofile());
      
      if (response.data?.status && response.data.data) {
        const schoolData = response.data.data;
const schoolAddress = schoolData.addresses?.[0] || {};

setFormData({
  name: schoolData.name || '',
  orgId: schoolData.official_code || '',
  address: schoolAddress.address_line_1 || '',
  addressId: schoolAddress.id || null,   // 👈 اینجا id رو ذخیره کن
  phone1: schoolData.phone_number_1 || '',
  phone2: schoolData.phone_number_2 || '',
  phone3: schoolData.phone_number_3 || '',
});
setInitialData({
  name: schoolData.name || '',
  orgId: schoolData.official_code || '',
  address: schoolAddress.address_line_1 || '',
  addressId: schoolAddress.id || null,   // 👈 اینجا هم
  phone1: schoolData.phone_number_1 || '',
  phone2: schoolData.phone_number_2 || '',
  phone3: schoolData.phone_number_3 || '',
});
      }
    } catch (error) {
      console.error("Failed to fetch school profile:", error);
    }
  };

  fetchSchoolProfile();
}, []);


  // ۴. منطق ارسال دیتا به سرور (Update) به اینجا منتقل می‌شود
  const sendDataToServer = async (data) => {
const payload = {
  name: data.name,
  official_code: data.orgId,
  phone_number_1: data.phone1,
  phone_number_2: data.phone2,
  phone_number_3: data.phone3,  
  address_line_1: data.address
};
    
    console.log("Sending data to server from EditSchool:", payload);
    try {
      await api.put(endpoints.schoolprofile(), payload);
    } catch (error) {
      console.error("Failed to update school profile:", error);
    }
  };

  const debouncedSendData = useDebounce(sendDataToServer, 1000);

useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }

  if (initialData && JSON.stringify(initialData) !== JSON.stringify(formData)) {
    debouncedSendData(formData);
  }
}, [formData, debouncedSendData, initialData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <div>
      <Header />
      <div className='App-Container'>
        <Sidebar />
        <div className='Main-Content' id='main'>
          {/* بخش هدر صفحه بدون تغییر باقی می‌ماند */}
          <div className={style.tiles}>
            <div className={style.tile}>
              <div className={style.header}>
                {/* از formData برای نمایش نام به‌روز شده استفاده می‌کنیم */}
                <p>نام آموزشگاه</p>
                 <img src={card} alt="" /> 
              </div>
              <h1>{formData.name || user?.school_information?.name}</h1>
            </div>
            <div className={style.tile}>
              <div className={style.header}>
                <p>مدیر</p>
                <img src={profile} alt="" /> 
              </div>
              <h1>{user?.profile?.first_name} {user?.profile?.last_name}</h1>
            </div>
          </div>
          
          {/* ۶. پاس دادن استیت و توابع به عنوان props به فرزند */}
          <AboutSchool 
            user={user}
            formData={formData} 
            onFormChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}