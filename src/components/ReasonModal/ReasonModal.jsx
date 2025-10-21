import React, { useState } from 'react';
import style from './ReasonModal.module.css'; // فایل CSS برای استایل‌دهی

const ReasonModal = ({ title, onSubmit, onCancel }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('لطفاً دلیل ابطال را وارد کنید.');
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modal}>
        <h2>{title}</h2>
        <textarea
          className={style.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="دلیل ابطال را وارد کنید..."
        />
        <div className={style.buttonContainer}>
          <button onClick={handleSubmit} className={style.submitButton}>
            تأیید
          </button>
          <button onClick={onCancel} className={style.cancelButton}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;