import React from 'react';
import style from './QuestionBox.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function QuestionBox({
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'بله', // مقدار پیش‌فرض
  cancelText = 'خیر', // مقدار پیش‌فرض
}) {
  return (
    <div className={style.QuestionBox}>
      <div className={style.modal}>
        <p>{message || 'خطای رخ داده است!!!'}</p>
        <div className={style.footer}>
          <button
            className={style.decline}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="لغو عملیات"
          >
            {cancelText}
          </button>
          <button
            className={style.agree}
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="تأیید عملیات"
          >
            {isLoading ? <LoadingSpinner /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}