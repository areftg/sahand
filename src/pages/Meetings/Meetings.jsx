import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import style from './Meetings.module.css'
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Meeting from '../../components/Meeting/Meeting';
import Add from '../../assets/icons/add.svg';
import QuestionBox from '../../components/QuestionBox/QuestionBox'; // فرض بر این که داری این کامپوننت رو

const LOCAL_STORAGE_KEY = "meetingDocumentFormData"; // یک کلید مخصوص خودت بذار

export default function Meetings() {
  const navigate = useNavigate();
  const [showQuestionBox, setShowQuestionBox] = useState(false);

  const handleNewDocumentClick = (e) => {
    e.preventDefault();
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedData) {
      setShowQuestionBox(true);
    } else {
      navigate("/Meetings/Document");
    }
  };

  const handleConfirm = () => {
    setShowQuestionBox(false);
    navigate("/Meetings/Document");
  };

  const handleCancel = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log("📌 داده‌های ذخیره‌شده پاک شد.");
    setShowQuestionBox(false);
    navigate("/Meetings/Document");
  };

  

  return (
    <div className={style.meetings}>
      <Header />
      <div className='App-Container'>
        <Sidebar />
        <div className='Main-Content'>
          <div className={style.balance}>   
            <div className={style.price}>
              <h1>جلسات</h1>
            </div>
            {/* تغییر NavLink به a یا button برای کنترل event */}
            <a href="/Meetings/Document" onClick={handleNewDocumentClick} className={style.button}>
              <img src={Add} alt="" />
              <p>جلسه جدید</p>
            </a>
          </div>
          <Meeting />
        </div>
      </div>

      {showQuestionBox && (
        <QuestionBox
          message="یک جلسه تکمیل نشده پیدا شد. آیا می‌خواهید با آن ادامه دهید؟"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
