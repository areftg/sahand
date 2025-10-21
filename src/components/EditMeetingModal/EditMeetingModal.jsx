import styles from './EditMeetingModal.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import api, { endpoints } from '../../config/api';
import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../../services/notificationService';


export default function EditMeetingModal({ onClose }) {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Flag to track if edits are unsaved
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load options for meeting edit
  useEffect(() => {
    const newOptions = ['زمان برگزاری', 'مشروح مذاکرات', 'تصمیمات اخذ شده'];
    setOptions(newOptions);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };

  const handleOptionClick = (option) => {
    setIsDirty(true);
    let path = '';

    switch (option) {
      case 'زمان برگزاری':
        path = '/Meetings/Document/2';
        break;
      case 'مشروح مذاکرات':
        path = '/Meetings/Document/3';
        break;
      case 'تصمیمات اخذ شده':
        path = '/Meetings/Document/4';
        break;
      default:
        alert('گزینه‌ای برای این انتخاب وجود ندارد');
        return;
    }

    navigate(path);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = JSON.parse(localStorage.getItem('meetingDocumentFormData'));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;

      const payload = {
        ...formData,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };

      // ارسال درخواست به سرور برای به‌روزرسانی
      await api.put(`${endpoints.meets}/full/${formData.id}`, payload);
      console.log('EditMeetingModal: جلسه به‌روزرسانی شد:', formData.id);

      // پاک کردن localStorage پس از ارسال موفق
      localStorage.removeItem('meetingDocumentFormData');
      localStorage.removeItem('openEditModal');

      setIsDirty(false);
      navigate('/Meetings');
      onClose();
    } catch (error) {
      console.error('EditMeetingModal: خطا در ثبت تغییرات:', error);
      let errorMessage = 'خطا در ثبت تغییرات';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
      }
      showWarningNotification(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      // پاک کردن localStorage هنگام بستن بدون تغییرات
      localStorage.removeItem('meetingDocumentFormData');
      localStorage.removeItem('openEditModal');
      onClose();
    }
  };

  const confirmClose = () => {
    // پاک کردن localStorage هنگام تأیید خروج
    localStorage.removeItem('meetingDocumentFormData');
    localStorage.removeItem('openEditModal');
    setShowConfirmClose(false);
    setIsDirty(false);
    onClose();
  };

  return (
    <div className={styles.modal_overlay} onClick={handleOverlayClick}>
      <div className={styles.modal_content}>
        <div className={styles.header}>
          <svg onClick={handleClose} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.894287 3.933L12.9576 15.9963L0.894287 28.0597L4.34096 31.5063L16.4043 19.443L28.4676 31.5063L31.9143 28.0597L19.851 15.9963L31.9143 3.933L28.4676 0.486328L16.4043 12.5497L4.34096 0.486328L0.894287 3.933Z"
              fill="white"
            />
          </svg>
          <p>مرحله موردنظر برای ویرایش را انتخاب کنید!</p>
        </div>

        <div className={styles.options_cont}>
          {options.map((option) => (
            <div key={option} className={styles.option} onClick={() => handleOptionClick(option)}>
              {option}
            </div>
          ))}
        </div>

        <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'در حال ثبت...' : 'ثبت'}
        </button>
      </div>

      {showConfirmClose && (
        <QuestionBox
          message="شما هنوز ادیت خود را ثبت نکرده‌اید. آیا مطمئن هستید می‌خواهید از این بخش خارج شوید؟"
          onConfirm={confirmClose}
          onCancel={cancelClose}
          isLoading={false}
        />
      )}
    </div>
  );
}