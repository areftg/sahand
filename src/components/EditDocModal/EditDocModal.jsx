import styles from './EditDocModal.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import api, { endpoints } from '../../config/api';


export default function EditDocModal({ onClose }) {
  const navigate = useNavigate();
  const [docType, setDocType] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [options, setOptions] = useState([]);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Flag to track if edits are unsaved
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch docType and determine accountType from localStorage with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData'));
      if (formData) {
        // Extract docType (adjust key if necessary)
        setDocType(formData.DocType|| null);

        // Check docRows for AccountID to determine accountType
        if (formData.docRows && Array.isArray(formData.docRows)) {
          const hasAccountID1 = formData.docRows.some(row => row.AccountID === 1);
          const hasAccountID1100 = formData.docRows.some(row => row.AccountID === 1100);

          if (hasAccountID1) {
            setAccountType('school_account');
          } else if (hasAccountID1100) {
            setAccountType('petty_cash');
          } else {
            setAccountType(null); // Fallback if no matching AccountID
          }
        }
      }
      console.log('llll', options);

    }, 500); // 500ms delay, adjust as needed

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Update options based on docType and accountType
  useEffect(() => {
    let newOptions = [];
    switch (docType) {
      case 'SaveRecievesDoc':
        newOptions = ['تاریخ ثبت سند', 'شرح و پیوست', 'نوع هزینه', 'شرح جزییات', 'مبلغ'];
        break;
      case 'savePaymentDoc':
        newOptions = ['تاریخ ثبت سند', 'شرح و پیوست', 'نوع هزینه', 'شرح جزییات', 'مبلغ'];
        if (accountType === 'school_account') {
          newOptions.push('ادیت چک');
        }
        break;
      default:
        newOptions = [];
    }
    setOptions(newOptions);
  }, [docType, accountType]);

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
      case 'تاریخ ثبت سند':
        path = '/Accounting/Document/3';
        break;
      case 'شرح و پیوست':
        path = '/Accounting/Document/4';
        break;
      case 'نوع هزینه':
      case 'شرح جزییات':
      case 'مبلغ':
        path = '/Accounting/Document/5';
        break;
      case 'ادیت چک':
        path = '/Accounting/Document/7';
        break;
      default:
        alert('گزینه‌ای برای این انتخاب وجود ندارد');
        return;
    }

    navigate(path);
  };


  // ... سایر کدها بدون تغییر ...
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData'));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;

      const payload = {
        ...formData,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };

      // ارسال درخواست به سرور برای به‌روزرسانی
      await api.put(`${endpoints.docs}/full/${formData.id}`, payload);
      console.log('EditDocModal: سند به‌روزرسانی شد:', formData.id);

      // پاک کردن localStorage پس از ارسال موفق
      localStorage.removeItem('accountingDocumentFormData');
      localStorage.removeItem('openEditModal');

      setIsDirty(false);
      navigate('/Accounting');
      onClose();
    } catch (error) {
      console.error('EditDocModal: خطا در ثبت تغییرات:', error);
      let errorMessage = 'خطا در ثبت تغییرات';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
      }
      // showWarningNotification(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      // پاک کردن localStorage هنگام بستن بدون تغییرات
      localStorage.removeItem('accountingDocumentFormData');
      localStorage.removeItem('openEditModal');
      onClose();
    }
  };

  const confirmClose = () => {
    // پاک کردن localStorage هنگام تأیید خروج
    localStorage.removeItem('accountingDocumentFormData');
    localStorage.removeItem('openEditModal');
    setShowConfirmClose(false);
    setIsDirty(false);
    onClose();
  };
  // ... سایر کدها بدون تغییر ...
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
          {options.length > 0 ? (
            options.map((option) => (
              <div key={option} className={styles.option} onClick={() => handleOptionClick(option)}>
                {option}
              </div>
            ))
          ) : (
            <LoadingSpinner />
          )}
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