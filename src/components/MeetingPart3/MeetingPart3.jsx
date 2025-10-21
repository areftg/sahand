import style from './MeetingPart3.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../MeetingFrame/MeetingFrame';
import React, { useState, useEffect, useRef } from 'react';
import TextEditor from '../TextEditor/TextEditor';
import '../TextEditor/TextEditor.css';
import { useNavigate } from 'react-router-dom';
import { showSuccessNotification, showWarningNotification } from '../../services/notificationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export default function MeetingPart3() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true); // برای کنترل اجرای اولیه useEffect

  // به‌روزرسانی localStorage با مقادیر جدید
  const updateLocalStorage = (newData) => {
    const currentFormData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
    const updatedFormData = {
      ...currentFormData,
      ...newData,
      sessionNumber: formData.session_id || currentFormData.sessionNumber || localStorage.getItem('session_id'),
      id: currentFormData.id || formData.session_id || localStorage.getItem('session_id'),
      isEditing,
    };
    localStorage.setItem('meetingDocumentFormData', JSON.stringify(updatedFormData));
  };

  // لود داده‌ها در حالت ویرایش
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // فقط در رندر اولیه اجرا شود
      const meetingFormData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
      if (meetingFormData.sessionNumber && meetingFormData.edit) {
        setIsEditing(true);
        updateFormData({ meetingMinutes: meetingFormData.meetingMinutes || '' });
        updateLocalStorage({ meetingMinutes: meetingFormData.meetingMinutes || '' });
      }
    }
  }, [updateFormData]);

  const handleMinutesChange = (content) => {
    updateFormData({ comment: content });
    updateLocalStorage({ comment: content }); // به‌روزرسانی localStorage با تغییر محتوا
  };

  const handleButtonClick = () => {
    // اعتبارسنجی
    if (!formData.comment || !formData.comment.trim()) {
      showWarningNotification('لطفاً مشروح مذاکرات را وارد کنید');
      return;
    }

    if (isEditing) {
      setIsLoading(true);
      updateLocalStorage({ meetingMinutes: formData.meetingMinutes });
      localStorage.setItem('openEditModal', 'true');
      showSuccessNotification('ویرایش جلسه موفقیت‌آمیز بود');
      navigate('/Meetings');
      setIsLoading(false);
    } else {
      updateLocalStorage({ meetingMinutes: formData.meetingMinutes });
      goToNextStep();
    }
  };

  return (
    <div className={style.DocumentPart2}>
      <h1>مشروح مذاکرات را وارد کنید</h1>
      <div className={style.container}>
        <div className={style.cont}>
          <TextEditor
            initialContent={formData.comment || ''}
            onContentChange={handleMinutesChange}
          />
        </div>
      </div>
      <button className={style.nextButton} onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : isEditing ? (
          'تأیید'
        ) : (
          <>
            مرحله بعدی <img src={Arrow} alt="next" style={{ height: '20px' }} />
          </>
        )}
      </button>
    </div>
  );
}