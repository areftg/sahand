import style from './DocumentPart4.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import { showWarningNotification, showSuccessNotification } from '../../services/notificationService.jsx';
import React, { useState, useEffect } from 'react';
import api, { endpoints } from '../../config/api.js';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function DocumentPart4() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(formData.amount || ''); // Initialize with formData if available
  const [billNo, setBillNo] = useState(formData.BillNo || ''); // Initialize with formData if available
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Flag to check if in edit mode

  // The description and attachment from formData
  const description = formData.Title || '';
  const attachment = formData.Attachment || '';

  // Check if in edit mode by checking localStorage
  useEffect(() => {
    const storedFormData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    if (storedFormData.id) {
      setIsEditing(true);
      // Initialize inputs with stored data if available
      setAmount(storedFormData.amount || '');
      setBillNo(storedFormData.BillNo || '');
    }
  }, []);

  // Convert Persian/Arabic digits to English
  const convertToEnglishDigits = (value) => {
    if (!value) return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const englishDigits = '0123456789';

    let result = value.toString().replace(/[,٫]/g, '');
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
      result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    return result;
  };

  // Handle amount input
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^[\d۰-۹٠-٩,]*$/.test(value)) {
      const englishValue = convertToEnglishDigits(value);
      if (/^\d*$/.test(englishValue)) {
        setAmount(englishValue);
        updateFormData({ amount: englishValue }); // Update formData
      }
    }
  };

  // Handle bill number input
  const handleBillNoChange = (e) => {
    const value = e.target.value;
    setBillNo(value);
    updateFormData({ BillNo: value }); // Update formData
  };

  const handleDescriptionChange = (e) => {
    updateFormData({ Title: e.target.value });
  };

  const handleAttachmentChange = (e) => {
    updateFormData({ Attachment: e.target.value });
  };

  // Logic to hide default text
  const hideDefault = description.length >= 180;

// ... سایر کدها بدون تغییر ...
const handleButtonClick = async () => {
  if (!description.trim()) {
    showWarningNotification('لطفاً شرح سند را وارد کنید');
    return;
  }

  if (formData.DocType === 'ReturnTankhahRemainDoc') {
    const parsedAmount = Number(convertToEnglishDigits(amount));
    if (!parsedAmount || parsedAmount <= 0) {
      showWarningNotification('لطفاً یک مبلغ معتبر برای برداشت از تنخواه وارد کنید');
      return;
    }
    if (!billNo.trim()) {
      showWarningNotification('لطفاً شماره فیش را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const updatedRows = [
        {
          AccountID: 1,
          Debtor: parsedAmount,
          Creditor: 0,
          DocRowDetails: [{ amount: parsedAmount, BillNo: billNo }],
        },
        {
          AccountID: 1100,
          Debtor: 0,
          Creditor: parsedAmount,
          DocRowDetails: [],
        },
      ];

      updateFormData({ docRows: updatedRows });
      console.log('DocumentPart4: docRows updated with amount and billNo:', updatedRows);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;

      const payload = {
        ...formData,
        docRows: updatedRows,
        chequeIds: [],
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };

      console.log('DocumentPart4: Payload for API:', payload);

      if (isEditing) {
        const response = await api.put(`${endpoints.docs}/${formData.id}`, payload);
        console.log('DocumentPart4: API response for update:', response.data);
        // ذخیره flag برای باز کردن مودال
        localStorage.setItem('openEditModal', 'true');
        // نگذارید localStorage پاک شود
        showSuccessNotification('ویرایش سند موفقیت‌آمیز بود');
        navigate('/Accounting');
      } else {
        const response = await api.post(`${endpoints.docs}/full`, payload);
        console.log('DocumentPart4: API response for create:', response.data);
        localStorage.removeItem('accountingDocumentFormData'); // فقط در حالت غیرویرایش پاک شود
        showSuccessNotification('ثبت سند موفقیت‌آمیز بود');
        navigate('/Accounting');
      }
    } catch (error) {
      console.error('DocumentPart4: Error submitting document:', error);
      let errorMessage = 'خطا در ارسال سند به سرور';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
      }
      showWarningNotification(errorMessage);
    } finally {
      setIsLoading(false);
    }
  } else {
    if (isEditing) {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user?.roles?.[0] === 'admin';
        const schoolId = user?.school_id;

        const payload = {
          ...formData,
          ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
        };

        const response = await api.put(`${endpoints.docs}/${formData.id}`, payload);
        console.log('DocumentPart4: API response for update:', response.data);
        // ذخیره flag برای باز کردن مودال
        localStorage.setItem('openEditModal', 'true');
        // نگذارید localStorage پاک شود
        showSuccessNotification('ویرایش سند موفقیت‌آمیز بود');
        navigate('/Accounting');
      } catch (error) {
        console.error('DocumentPart4: Error updating document:', error);
        let errorMessage = 'خطا در ویرایش سند';
        if (error.response) {
          errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
        }
        showWarningNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      goToNextStep();
    }
  }
};
// ... سایر کدها بدون تغییر ...

  return (
    <div className={style.DocumentPart4}>
      <h1>شرح سند و پیوست آن را وارد کنید</h1>
      <div className={style.list}>
        <div className={style.option}>
          <p>شرح سند:</p>
          <textarea
            className={style.title}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="شرح سند خود را وارد کنید..."
          />
          {/* {!hideDefault && (
            <div className={style.default}>شرح های پیش فرض</div>
          )} */}
        </div>
        <div className={style.option}>
          <p>پیوست:</p>
          <input
            className={style.title}
            value={attachment}
            onChange={handleAttachmentChange}
            placeholder="پیوست خود را وارد کنید"
          />
          {formData.DocType === 'ReturnTankhahRemainDoc' && (
            <>
              <p>فیش:</p>
              <input
                type="text"
                className={style.title}
                value={billNo}
                onChange={handleBillNoChange}
                placeholder="شماره فیش را وارد کنید"
              />
            </>
          )}
        </div>
        {formData.DocType === 'ReturnTankhahRemainDoc' && (
          <div className={style.option}>
            <p>مبلغ:</p>
            <input
              type="text"
              className={style.title}
              value={amount}
              onChange={handleAmountChange}
              placeholder="مبلغ را وارد کنید (ریال)"
            />
          </div>
        )}
      </div>
      <button className={style.nextButton} onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : isEditing ? (
          'تایید'
        ) : (
          <>
            مرحله بعدی <img src={Arrow} alt="" style={{ height: '20px' }} />
          </>
        )}
      </button>
    </div>
  );
}