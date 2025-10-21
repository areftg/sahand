import style from './MeetingPart4.module.css';
import add from '../../assets/icons/add.svg';
import { useFormData } from '../MeetingFrame/MeetingFrame';
import React, { useState, useEffect, useRef } from 'react';
import Cheq from '../Cheq/Cheq';
import { useNavigate } from 'react-router-dom';
import QuestionBox from '../QuestionBox/QuestionBox';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { showSuccessNotification, showWarningNotification, showErrorNotification } from '../../services/notificationService';
import api, { endpoints } from "../../config/api.js";

export default function MeetingPart4() {
  const { formData, updateFormData, isModal, onClose } = useFormData();
  const navigate = useNavigate();
  const [showCheq, setShowCheq] = useState(false);
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [decisions, setDecisions] = useState(
    formData.decisions ? formData.decisions.map((item) => item.title) : []
  );
  const [newItemText, setNewItemText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
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
        updateFormData({
          decisions: meetingFormData.decisions || [],
        });
        setDecisions(meetingFormData.decisions ? meetingFormData.decisions.map((item) => item.title) : []);
        updateLocalStorage({
          decisions: meetingFormData.decisions || [],
        });
      }
    }
  }, [updateFormData]);

  const stopPropagation = (e) => e.stopPropagation();

  const handleDecisionChange = (index, value) => {
    const updatedDecisions = [...decisions];
    updatedDecisions[index] = value;
    setDecisions(updatedDecisions);
    updateFormData({ decisions: updatedDecisions.map((title) => ({ title })) });
    updateLocalStorage({ decisions: updatedDecisions.map((title) => ({ title })) });
  };

  const handleAddItem = () => {
    if (newItemText.trim() === '') {
      showWarningNotification('لطفاً متن تصمیم را وارد کنید');
      return;
    }
    setIsAddingLoading(true);
    const updatedDecisions = [...decisions, newItemText.trim()];
    setDecisions(updatedDecisions);
    updateFormData({
      decisions: updatedDecisions.map((title) => ({ title })),
    });
    updateLocalStorage({
      decisions: updatedDecisions.map((title) => ({ title })),
    });
    setNewItemText('');
    setIsAddingNew(false);
    showSuccessNotification('تصمیم با موفقیت اضافه شد.');
    setIsAddingLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    setIsAddingLoading(true);
    const updatedDecisions = decisions.filter((_, index) => index !== indexToRemove);
    setDecisions(updatedDecisions);
    updateFormData({
      decisions: updatedDecisions.map((title) => ({ title })),
    });
    updateLocalStorage({
      decisions: updatedDecisions.map((title) => ({ title })),
    });
    showSuccessNotification('تصمیم با موفقیت حذف شد.');
    setIsAddingLoading(false);
  };

  const handleCheqSubmit = (cheqData) => {
    if (!formData.cheque_book_id) {
      showErrorNotification('شناسه دفترچه چک یافت نشد.');
      return;
    }
    setIsSubmitting(true);
    const updatedFormData = {
      ...formData,
      chequeIds: [...(formData.chequeIds || []), cheqData.id],
    };
    updateFormData(updatedFormData);
    updateLocalStorage({ chequeIds: updatedFormData.chequeIds });
    showSuccessNotification('چک با موفقیت اضافه شد.');
    setShowCheq(false);
    setIsSubmitting(false);
  };

  const handleCheq = () => {
    if (!formData.cheque_book_id) {
      showErrorNotification('شناسه دفترچه چک یافت نشد.');
      return;
    }
    setShowCheq(true);
  };

  const handleButtonClick = () => {
    if (decisions.length === 0) {
      showWarningNotification('لطفاً حداقل یک تصمیم وارد کنید');
      return;
    }
    setIsSubmitting(true);
    updateLocalStorage({
      decisions: decisions.map((title) => ({ title })),
    });
    localStorage.setItem('openEditModal', 'true');
    showSuccessNotification('تغییرات با موفقیت ذخیره شد');
    navigate('/Meetings');
    setIsSubmitting(false);
  };

  const handleNextStep = () => {
    if (decisions.length === 0) {
      showWarningNotification('لطفاً حداقل یک تصمیم وارد کنید');
      return;
    }
    if (isEditing) {
      handleButtonClick();
    } else {
      updateLocalStorage({
        decisions: decisions.map((title) => ({ title })),
      });
      setShowQuestionBox(true);
    }
  };

  const handleQuestionBoxConfirm = async () => {
    setIsLoading(true); // اگر loading spinner داری
    try {
      const formData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
  
      if (!formData || Object.keys(formData).length === 0) {
        throw new Error('اطلاعات جلسه وجود ندارد یا نامعتبر است.');
      }
  
      // گرفتن اطلاعات کاربر و بررسی ادمین بودن
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;
  
      // آماده‌سازی payload
      const payload = {
        ...formData,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };
  
      // ارسال داده به سرور
      await api.post(`${endpoints.meets}/full`, payload);
      showSuccessNotification('اطلاعات جلسه با موفقیت ثبت شد');
  
      // اجرای تابع اصلی بعد از ارسال
      handleCheq();
  
    } catch (error) {
      console.error('خطا در ارسال اطلاعات جلسه به سرور:', error);
      const errorMessage = error.response?.data?.message || error.message || 'خطای ناشناخته';
      showErrorNotification(errorMessage);
    } finally {
      // پاک‌سازی localStorage
      localStorage.removeItem('session_id');
      localStorage.removeItem('meetingDocumentFormData');
  
      setShowQuestionBox(false);
      setIsLoading(false); // اگر loading spinner داری
    }
  };
  
  const handleQuestionBoxCancel = async () => {
    setIsLoading(true); // اگر میخوای loading spinner داشته باشی
    try {
      const formData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
  
      if (!formData || Object.keys(formData).length === 0) {
        throw new Error('اطلاعات جلسه وجود ندارد یا نامعتبر است.');
      }
  
      // گرفتن اطلاعات کاربر و بررسی ادمین بودن
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;
  
      // آماده‌سازی payload
      const payload = {
        ...formData,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };
  
      // ارسال داده به سرور
      await api.post(`${endpoints.meets}/full`, payload);
      showSuccessNotification('اطلاعات جلسه با موفقیت ثبت شد');
  
    } catch (error) {
      console.error('خطا در ارسال اطلاعات جلسه به سرور:', error);
      const errorMessage = error.response?.data?.message || error.message || 'خطای ناشناخته';
      showErrorNotification(errorMessage);
    } finally {
      // پاک‌سازی localStorage
      localStorage.removeItem('session_id');
      localStorage.removeItem('meetingDocumentFormData');
  
      setShowQuestionBox(false);
  
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.warn('onClose is not a function, skipping call');
      }
  
      if (!isModal) {
        navigate('/Meetings');
      }
  
      setIsLoading(false); // اگر loading spinner استفاده می‌کنید
    }
  };
  
  

  return (
    <div className={style.DocumentPart2}>
      <h1>تصمیمات اخذ شده را وارد کنید</h1>
      <div className={style.container}>
        {decisions.map((decision, index) => (
          <div key={index} className={style.item}>
            <p>{index + 1}</p>
            <input
              type="text"
              value={decision}
              onChange={(e) => handleDecisionChange(index, e.target.value)}
              className={style.decisionInput}
              disabled={isAddingLoading}
            />
            <button onClick={() => handleRemoveItem(index)} disabled={isAddingLoading}>
              {isAddingLoading ? <LoadingSpinner size="small" /> : 'حذف'}
            </button>
          </div>
        ))}
        {isAddingNew ? (
          <div className={style.addItemInput}>
            <button onClick={() => setIsAddingNew(false)} disabled={isAddingLoading}>
              ╳
            </button>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="تصمیم جدید را وارد کنید"
              autoFocus
              disabled={isAddingLoading}
              className={style.decisionInput}
            />
            <button onClick={handleAddItem} disabled={isAddingLoading}>
              {isAddingLoading ? <LoadingSpinner size="small" /> : 'افزودن'}
            </button>
          </div>
        ) : (
          <div className={style.additem} onClick={() => setIsAddingNew(true)}>
            <img src={add} alt="اضافه کردن" />
            <p>+</p>
            <p>برای افزودن تصمیم جدید کلیک کنید</p>
          </div>
        )}
      </div>
      <div className={style.nextButtoncont}>
        <button className={style.nextButton} onClick={handleNextStep} disabled={isSubmitting || isAddingLoading}>
          {isSubmitting ? <LoadingSpinner size="small" /> : (isEditing ? 'تأیید' : <>
            ثبت جلسه
            <svg
              width="30"
              height="24"
              viewBox="0 0 30 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.5255 1.17522L23.6569 3.04387L19.1973 7.50344L13.7803 12.9204L9.12339 17.5774C8.36753 18.3332 7.60327 19.0765 6.85581 19.8449L6.82222 19.8785H9.79107L7.92241 18.0099L3.46284 13.5503L-1.95415 8.13332L-6.61108 3.47639C-7.36694 2.72053 -8.1144 1.95627 -8.87866 1.20881L-8.91225 1.17522C-9.29438 0.793091 -9.85708 0.562134 -10.3988 0.562134C-10.9153 0.562134 -11.5284 0.788891 -11.8853 1.17522C-12.2506 1.57415 -12.5236 2.09904 -12.4984 2.66174C-12.4732 3.22024 -12.2842 3.74514 -11.8853 4.14827L-10.0166 6.01692L-5.55708 10.4765L-0.140088 15.8935L4.51685 20.5504C5.27271 21.3063 6.02017 22.0705 6.78443 22.818L6.81802 22.8516C7.62007 23.6536 8.98482 23.6536 9.78687 22.8516C10.4167 22.2259 11.0382 21.6002 11.6639 20.9787L16.1235 16.5192L21.5405 11.1022L26.1974 6.44524C26.9533 5.68938 27.7175 4.94192 28.465 4.17766L28.4986 4.14407C28.8807 3.76194 29.1117 3.19924 29.1117 2.65754C29.1117 2.14104 28.8849 1.52795 28.4986 1.17102C28.0997 0.805687 27.5748 0.53274 27.0121 0.557936C26.4536 0.58733 25.9287 0.772095 25.5255 1.17522Z"
                fill="white"
              />
            </svg></>)}
        </button>
      </div>
      {showCheq && (
        <div className={style.cheqModal} onClick={() => setShowCheq(false)}>
          <div className={style.cheqContent} onClick={stopPropagation}>
            <Cheq onSubmit={handleCheqSubmit} chequeBookId={formData.cheque_book_id} />
          </div>
        </div>
      )}
      {showQuestionBox && (
        <QuestionBox
          message="آیا می‌خواهید برای این جلسه چک اضافه کنید؟"
          onConfirm={handleQuestionBoxConfirm}
          onCancel={handleQuestionBoxCancel}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}