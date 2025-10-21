import React, { useState, useEffect } from 'react';
import ShamsiDatePicker from '../../components/Calendar/ShamsiDatePicker';
import style from "./PLeave.module.css";
import calender from "../../assets/icons/Calender.svg";

export default function PLeave() {
  const [isMobile, setIsMobile] = useState(false);
  
  // State برای باز و بسته بودن هر تقویم
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // State برای نگهداری تاریخ‌های انتخاب شده
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // توابع برای مدیریت انتخاب تاریخ و ذخیره در state
  const handleStartDateSelect = (date) => {
    const formattedDate = date.format('YYYY/MM/DD');
    setStartDate(formattedDate);
    setIsStartDatePickerOpen(false); // بستن تقویم پس از انتخاب
  };

  const handleEndDateSelect = (date) => {
    const formattedDate = date.format('YYYY/MM/DD');
    setEndDate(formattedDate);
    setIsEndDatePickerOpen(false); // بستن تقویم پس از انتخاب
  };

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 450);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ کامپوننت موبایل اکنون کاملا فعال است
  if (isMobile) {
    return (
      <div className={style.PleaveMobile}>
        <div className={style.container}>
          <p>دلیل:</p>
          <input className={`${style.input} ${style.input1}`} type="text" />
          
          <p>تاریخ شروع:</p>
          <div className={style.mobileInputContainer}>
            <input 
              className={style.input} 
              type="text" 
              value={startDate} 
              onClick={() => setIsStartDatePickerOpen(p => !p)}
              readOnly // جلوگیری از تایپ دستی
            />
            <div className={style.mobilecalendercontainer}>
              <img src={calender} alt="calendar icon" onClick={() => setIsEndDatePickerOpen(p => !p)} />
            </div>
            <ShamsiDatePicker 
              isOpen={isStartDatePickerOpen} 
              onClose={() => setIsStartDatePickerOpen(false)} 
              onSelectDate={handleStartDateSelect} 
            />
          </div>

          <p>تاریخ پایان:</p>
          <div className={style.mobileInputContainer}>
            <input 
              className={style.input} 
              type="text" 
              value={endDate}
              onClick={() => setIsEndDatePickerOpen(p => !p)}
              readOnly 
            />
            <div className={style.mobilecalendercontainer}>
              <img src={calender} alt="calendar icon" onClick={() => setIsEndDatePickerOpen(p => !p)} />
            </div>
            <ShamsiDatePicker 
              isOpen={isEndDatePickerOpen} 
              onClose={() => setIsEndDatePickerOpen(false)} 
              onSelectDate={handleEndDateSelect} 
            />
          </div>
        </div>
        <div className={style.buttoncontainer}>
          <button className={style.button}>ارسال درخواست</button>
        </div>
      </div>
    );
  }

  // نسخه دسکتاپ
  return (
    <div className={style.PLeave}>
      <h1>درخواست مرخصی</h1>
      <div className={style.content}>
        <div className={style.right}>
          <p>دلیل:</p>
          <p>تاریخ شروع:</p>
        </div>
        <div className={style.left}>
          <textarea className={style.Reason} type="text" />
          <div className={style.history}>
            {/* -- انتخابگر تاریخ شروع -- */}
            <div className={style.inputcontainer}>
              <input 
                className={style.input2} 
                type="text" 
                value={startDate}
                onClick={() => setIsStartDatePickerOpen(p => !p)}
                readOnly
              />
              <div className={style.calendercontainer} onClick={() => setIsStartDatePickerOpen(prev => !prev)}>
                <img src={calender} className={style.calendarPopup} alt=''/>
              </div>
              <ShamsiDatePicker 
                isOpen={isStartDatePickerOpen} 
                onClose={() => setIsStartDatePickerOpen(false)} 
                onSelectDate={handleStartDateSelect} 
              />
            </div>
            
            <p>تاریخ پایان:</p>

            {/* -- انتخابگر تاریخ پایان -- */}
            <div className={style.inputcontainer}>
              <input 
                className={style.input2} 
                type="text" 
                value={endDate}
                onClick={() => setIsEndDatePickerOpen(p => !p)}
                readOnly
              />
              <div className={style.calendercontainer} onClick={() => setIsEndDatePickerOpen(prev => !prev)}>
                <img src={calender} className={style.calendarPopup} alt=''/>
              </div>
              <ShamsiDatePicker 
                isOpen={isEndDatePickerOpen} 
                onClose={() => setIsEndDatePickerOpen(false)} 
                onSelectDate={handleEndDateSelect} 
              />
            </div>
          </div>
        </div>
      </div>
      <button className={style.button}>ارسال درخواست</button>
    </div>
  );
}