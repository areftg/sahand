import React, { useState, useEffect } from 'react';
import style from './UserEdit.module.css';
import { showErrorNotification, showSuccessNotification ,showWarningNotification} from '../../services/notificationService';
import api, { endpoints } from "../../config/api";
 import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useNavigate } from 'react-router-dom';


export default function UserEdit({formData,setFormData,message,setMessage}) {

    const navigate = useNavigate(); // Assuming you might want to redirect

    const [ isloading , setIsloading ] = useState(false);
   


    // مدیریت تغییرات در هر اینپوت
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };


    // ======================== [تغییرات در این بخش] ========================
    // مدیریت ارسال فرم به سرور
    const handleSubmit = async () => {
        setMessage(''); // پاک کردن پیام قبلی
        
        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            showSuccessNotification("رمز عبور جدید و تکرار آن مطابقت ندارند.");
            return;
        }
        setIsloading(true);

        // ساخت آبجکت داده‌ها برای ارسال مطابق با کلیدهای سرور
        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            national_code: formData.nationalId, // Key updated to match server
            phone_number: formData.phoneNumber,
            father_name: formData.fatherName,
        };
        
        // اگر رمز عبور جدید وارد شده بود، آن را هم به پیلود اضافه کن
        // فرض می‌کنیم کلیدهای مورد انتظار سرور old_password و password هستند
        if (formData.newPassword && formData.currentPassword) {
            payload.password = formData.newPassword;
            payload.old_password = formData.currentPassword;
        }

        try {
            const response = await api.put(endpoints.profile(), payload); 
            showSuccessNotification("تغییرات با موفقیت ذخیره شد.");
            
        } catch (error) {
            console.error("Error updating profile:", error);
            // تلاش برای نمایش پیام خطای سرور در صورت وجود
            const errorMessage = error.response?.data?.message || "خطا در ذخیره تغییرات. لطفا دوباره تلاش کنید.";
            setMessage(errorMessage);
            setIsloading(false)
        }finally{
           setIsloading(false) 
        }
    };
    // ======================== [پایان تغییرات] ========================

      
    return (
        <div className={style.UserEdit}>
                  {/* <p className={style.attention}>تغییرات به صورت خودکار ذخیره می شوند</p> */}
            <div className={style.container}>
        
                <div className={style.right}>
                    <div className={` ${style.row} ${style.firstrow}`}>
                        <p>نام:</p>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} className={style.item} type="text" placeholder='نام خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>نام خانوادگی:</p>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} className={style.item} type="text" placeholder='نام خانوادگی خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>نام کاربری:</p>
                        <input name="username" value={formData.username} onChange={handleChange} className={style.item} type="text" placeholder='نام کاربری خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>کدملی:</p>
                        <input name="nationalId" value={formData.nationalId} onChange={handleChange} className={style.item} type="text" placeholder='کدملی خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>شماره تماس:</p>
                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={style.item} type="text" placeholder='شماره تماس خود را وارد کنید' />
                    </div>
                </div>

                <div className={style.left}>
                    <div className={` ${style.row} ${style.firstrow}`}>
                        <p>نام پدر:</p>
                        <input name="fatherName" value={formData.fatherName} onChange={handleChange} className={style.item} type="text" placeholder='  نام پدر خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>رمز عبور فعلی:</p>
                        <input name="currentPassword" value={formData.currentPassword} onChange={handleChange} className={style.item} type="password" placeholder='رمز عبور فعلی خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>رمز عبور جدید:</p>
                        <input name="newPassword" value={formData.newPassword} onChange={handleChange} className={style.item} type="password" placeholder='رمز عبود جدید خود را وارد کنید' />
                    </div>
                    <div className={style.row}>
                        <p>تکرار رمز عبور جدید:</p>
                        <input name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className={style.item} type="password" placeholder=' رمز عبور جدید خود را وارد کنید' />
                    </div>
                    <div className={style.dash}></div>
                    {message && <p className={style.message}>{message}</p>}
                    <button onClick={handleSubmit} className={style.button}>{isloading ? <LoadingSpinner/>:`ثبت تغییرات`}</button>
                </div>
            </div>

        </div>
    );
}