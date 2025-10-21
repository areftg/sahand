import React, { useState, useEffect } from 'react';
import QuestionBox from '../components/QuestionBox/QuestionBox';
import api, { endpoints } from "../config/api";
import moment from 'jalali-moment'; // اضافه کردن کتابخانه jalali-moment

const FISCAL_END_DATE_KEY = 'fiscalEndDate';
const IS_FISCAL_ENDED_KEY = 'isFiscalYearEnded';

// تابع برای چک کردن وضعیت سال مالی از backend
const checkFiscalYearEnded = async (specificDate) => {
    try {
        const response = await api.get(`${endpoints.FiscalYear}?date=${specificDate.toISOString()}`);
        const data = await response.data;
        console.log('Fiscal year check response:', data);
        return data.data.is_outside;
    } catch (error) {
        console.error('Error checking fiscal year:', error);
        return false;
    }
};

// تابع برای تغییر به سال مالی بعدی
const switchToNextFiscalYear = async () => {
    try {
      // school_id رو از localStorage بخون
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      const schoolId = user?.school_id;
  
      if (!schoolId) {
        console.error("School ID not found in localStorage");
        return false;
      }
  
      // حالا از schoolId بجای 2 استفاده کن
      const response = await api.post(`${endpoints.schools}/${schoolId}/close-year`);
      console.log('Switched to next fiscal year');
      return response.status === 200;
    } catch (error) {
      console.error('Error switching fiscal year:', error);
      return false;
    }
  };
  

// کامپوننت اصلی برای مدیریت سال مالی
export default function FiscalYearManager() {
    const [showQuestionBox, setShowQuestionBox] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // تابع برای گرفتن تاریخ پایان سال مالی (30 مهر هر سال شمسی)
    const getFiscalEndDate = () => {
        const today = moment().locale('fa'); // تاریخ امروز به شمسی
        const jalaliYear = today.jYear(); // سال شمسی فعلی
        // 30 مهر (ماه‌ها در jalali-moment از 1 شروع می‌شوند)
        let fiscalEndDate = moment(`${jalaliYear}/07/1`, 'jYYYY/jMM/jDD').locale('fa');

        // اگر امروز بعد از 30 مهر است، سال مالی بعدی را در نظر بگیر
        if (today.isAfter(fiscalEndDate)) {
            fiscalEndDate = moment(`${jalaliYear}/07/1`, 'jYYYY/jMM/jDD').locale('fa');
        }
        
        // تبدیل به تاریخ میلادی برای استفاده در درخواست‌ها یا مقایسه
        return fiscalEndDate.toDate();
    };

    // تابع برای چک کردن و مدیریت وضعیت سال مالی
    const handleFiscalCheck = async () => {
        const today = moment().locale('fa').toDate(); // تاریخ امروز به میلادی
        const specificDate = getFiscalEndDate(); // تاریخ پایان سال مالی به میلادی

        console.log('Fiscal end date:', moment(specificDate).locale('fa').format('jYYYY/jMM/jDD'));
        console.log('Today:', moment(today).locale('fa').format('jYYYY/jMM/jDD'));

        // اگر تاریخ امروز به تاریخ پایان سال مالی رسیده یا گذشته باشد
        if (today >= specificDate) {
            localStorage.removeItem(IS_FISCAL_ENDED_KEY);
        }

        // چک کردن وضعیت از localStorage یا backend
        const storedIsEnded = localStorage.getItem(IS_FISCAL_ENDED_KEY);
        if (!storedIsEnded) {
            const isEnded = await checkFiscalYearEnded(specificDate);
            localStorage.setItem(IS_FISCAL_ENDED_KEY, isEnded.toString());
            setShowQuestionBox(isEnded);
        } else {
            setShowQuestionBox(storedIsEnded === 'true');
        }
    };

    useEffect(() => {
        handleFiscalCheck();
    }, []); // فقط یک‌بار هنگام لود کامپوننت اجرا می‌شود

    const handleConfirm = async () => {
        setIsLoading(true);
        const success = await switchToNextFiscalYear();
        if (success) {
            localStorage.setItem(IS_FISCAL_ENDED_KEY, 'false');
            setShowQuestionBox(false);
            window.location.reload();
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        setShowQuestionBox(false);
    };

    return (
        <div>
            {showQuestionBox && (
                <QuestionBox
                    message="سال مالی تمام شده. آیا مایلید به سال مالی بعدی بروید؟"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                    confirmText="بله"
                    cancelText="خیر"
                />
            )}
        </div>
    );
}