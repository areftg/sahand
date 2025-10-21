import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import style from './EditUser.module.css'
import UserEditHeader from '../../components/UserEditHeader/UserEditHeader';
import UserEdit from '../../components/UserEdit/UserEdit'
import api, { endpoints } from "../../config/api";


export default function EditUser() {
     const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        nationalId: '', // In server response it's national_code
        phoneNumber: '',
        fatherName: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        role:''
    });

     useEffect(() => {
            const fetchUserData = async () => {
                try {
                    // The API response itself is what you provided
                    const response = await api.get(endpoints.profile());
                    
                    // The actual user profile is inside response.data.data
                    const profileData = response.data.data;
                    console.log(profileData)
    
                    // Update the state based on the received data structure
                    setFormData(prevData => ({
                        ...prevData,
                        firstName: profileData.first_name || '',
                        lastName: profileData.last_name || '',
                        username: profileData.user.username || '',
                        nationalId: profileData.national_code || '',
                        phoneNumber: profileData.phone_number || '',
                        role: profileData.user.roles[0].code
                        // fatherName is not in the response, so it remains as is
                    }));
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setMessage("خطا در دریافت اطلاعات کاربر");
                }
            };
    
            fetchUserData();
        }, []);


  return (
    <div className='Dashboard'>
      <Header />
      <div className='App-Container'>
        <Sidebar />
        <div className='Main-Content'>
            <UserEditHeader formData={formData} setFormData={setFormData} setMessage={setMessage} message={message} />
            <UserEdit formData={formData} setFormData={setFormData} setMessage={setMessage} message={message} />
        </div>
      </div>
    </div>
  );
}
