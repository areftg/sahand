// AboutSchool.js

import React, { useState } from 'react'; // فقط نیازمندی‌های UI باقی می‌ماند
import style from './AboutSchool.module.css';
import MatchingModal from '../../components/MatchingModal/MatchingModal';
import { useNavigate } from 'react-router-dom';

// تمام منطق دیتا، هوک‌ها و توابع مربوط به سرور حذف شده‌اند

export default function AboutSchool({ user, formData, onFormChange }) { // ۱. دریافت props از پدر
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSaveConnections = (connections) => {

    setIsModalOpen(false);
  };

  return (
    <div className={style.AboutSchool}>
      <MatchingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConnections}
      />
      <p className={style.attention}>تغییرات به صورت خودکار ذخیره میشوند</p>
      <div className={style.container}>
        <div className={style.right}>
          <div className={style.row}>
            <p>نام آموزشگاه:</p>
            <input 
              name="name"
              className={style.item} 
              value={formData.name}       // ۲. استفاده از props
              onChange={onFormChange}     // ۳. استفاده از props
              type="text" 
              placeholder='نام آموزشگاه را وارد کنید' 
            />
          </div>
          <div className={style.row}>
            <p>کد آموزشگاه:</p>
            <input 
              name="orgId"
              className={style.item} 
              value={formData.orgId}      // استفاده از props
              onChange={onFormChange}     // استفاده از props
              type="text" 
              placeholder='کد آموزشگاه را وارد کنید' 
            />
          </div>
          {/* سایر اینپوت‌ها نیز به همین شکل از props استفاده می‌کنند */}
          <div className={style.row}>
            <p>شماره تماس1:</p>
            <input 
              name="phone1"
              className={style.item} 
              value={formData.phone1}
              onChange={onFormChange}
              type="text" 
              placeholder='شماره تماس1 را وارد کنید' 
            />
          </div>
          <div className={style.row}>
            <p>شماره تماس2:</p>
            <input 
              name="phone2"
              className={style.item} 
              value={formData.phone2}
              onChange={onFormChange}
              type="text" 
              placeholder='شماره تماس2 را وارد کنید' 
            />
          </div>
          <div className={style.row}>
            <p>شماره تماس3:</p>
            <input 
              name="phone3"
              className={style.item} 
              value={formData.phone3}
              onChange={onFormChange}
              type="text" 
              placeholder='شماره تماس3 را وارد کنید' 
            />
          </div>
        </div>

        <div className={style.left}>
          <div className={style.leftrow}>
            <p>نشانی آموزشگاه:</p>
            <textarea 
              name="address" 
              className={style.leftitem} 
              value={formData.address}    // استفاده از props
              onChange={onFormChange}     // استفاده از props
              id="1" 
              placeholder='نشانی آموزشگاه را وارد کنید'
            ></textarea>
          </div>
          <div className={style.dash}></div>
          <div className={style.row}>
            <p>افزودن دانش آموز:</p>
            <div className={style.flex}>
              <button className={`${style.button} ${style.excelButton}`} onClick={() => setIsModalOpen(!isModalOpen)}>افزودن با فایل اکسل</button>
              <button onClick={() => { navigate("/AddStudent") }} className={style.button}>افزودن تکی</button>
            </div>
          </div>
          {/* بقیه دکمه‌ها بدون تغییر باقی می‌مانند */}
          <div className={style.row}>
            <p>افزودن دبیر:</p>
            <div className={style.flex}>
              <button className={`${style.button} ${style.excelButton}`}>افزودن با فایل اکسل</button>
              <button onClick={() => { navigate("/AddTeacher") }} className={style.button}>افزودن تکی</button>
            </div>
          </div>
          <div className={style.row}>
            <p>افزودن معاون:</p>
            <div className={style.flex}>
              <button className={`${style.button} ${style.excelButton}`}>افزودن با فایل اکسل</button>
              <button onClick={() => { navigate("/AddDeputy") }} className={style.button}>افزودن تکی</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}