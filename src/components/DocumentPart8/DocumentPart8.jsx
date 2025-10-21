import style from './DocumentPart8.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Trash from '../../assets/icons/Trash.svg';
import Pan from '../../assets/icons/pan.svg';
import DynamicTooltip from '../DynamicTooltip/DynamicTooltip';
import Arrow from '../../assets/icons/arrow.svg';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import api, { endpoints } from '../../config/api';
import { showErrorNotification, showSuccessNotification } from '../../services/notificationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export default function DocumentPart8() {
  const { goToNextStep } = useFormData();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // دریافت docRows و DocType از accountingDocumentFormData در localStorage
  const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
  const records = formData.docRows || [];
  const docType = formData.DocType;

  // تبدیل اعداد انگلیسی به فارسی با جداکننده نقطه
  const convertToPersianDigits = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    let result = Number(value).toString();
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(i, 'g'), persianDigits[i]);
    }
    return result.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // استفاده از نقطه به‌عنوان جداکننده
  };

  // تابع محاسبه جمع مبالغ فاکتورها
  const calculateTotalAmount = () => {
    let total = 0;
    records.forEach((row) => {
      if (row.AccountID !== 1) { // فقط رکوردهایی که AccountID آنها 1 نیست
        const debtor = parseFloat(row.Debtor) || 0;
        const creditor = parseFloat(row.Creditor) || 0;
        total += debtor + creditor;
      }
    });
    return total;
  };

  // افزودن رکورد جدید هنگام لود صفحه یا تغییر DocType
  // useEffect(() => {
  //   if (['SaveRecievesDoc', 'savePaymentDoc'].includes(docType)) {
  //     // حذف تمام رکوردهای قبلی با AccountID: 1
  //     const filteredRecords = records.filter((record) => record.AccountID !== 1);

  //     // محاسبه جمع کل
  //     const totalAmount = calculateTotalAmount();

  //     // ایجاد رکورد جدید بر اساس DocType
  //     const newRecord = {
  //       AccountID: 1,
  //       Debtor: docType === 'SaveRecievesDoc' ? totalAmount : 0,
  //       Creditor: docType === 'savePaymentDoc' ? totalAmount : 0,
  //     };

  //     // به‌روزرسانی docRows با اضافه کردن رکورد جدید
  //     const updatedRecords = [...filteredRecords, newRecord];
  //     const updatedFormData = {
  //       ...formData,
  //       docRows: updatedRecords,
  //     };

  //     // ذخیره داده‌های به‌روزرسانی‌شده در localStorage
  //     localStorage.setItem('accountingDocumentFormData', JSON.stringify(updatedFormData));
  //   }
  // }, [docType, records]); // اضافه کردن records به وابستگی‌ها برای بررسی تغییرات

  // تابع مدیریت حذف با تأیید
  const handleDelete = (idToDelete) => {
    setRecordToDelete(idToDelete);
    setShowConfirm(true);
  };

  // تابع تأیید حذف
  const confirmDelete = () => {
    const updatedRecords = records.filter((record) => record.id !== recordToDelete);
    const updatedFormData = {
      ...formData,
      docRows: updatedRecords,
    };
    localStorage.setItem('accountingDocumentFormData', JSON.stringify(updatedFormData));
    setShowConfirm(false);
    setRecordToDelete(null);
  };

  // تابع لغو حذف
  const cancelDelete = () => {
    setShowConfirm(false);
    setRecordToDelete(null);
  };

  // تابع مدیریت ویرایش
  const handleEdit = (recordId) => {
    const updatedFormData = {
      ...formData,
      recordToEditId: recordId,
    };
    localStorage.setItem('accountingDocumentFormData', JSON.stringify(updatedFormData));
    navigate('/Accounting/Document/5');
  };

  // تابع ارسال اطلاعات به سرور
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // بررسی معتبر بودن داده‌ها
      if (!formData || !formData.docRows || !formData.DocType) {
        throw new Error('داده‌های فرم نامعتبر است یا وجود ندارد');
      }
      if (!formData.docRows.length) {
        throw new Error('هیچ رکوردی برای ثبت سند وجود ندارد.');
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles[0] === 'admin';
      const schoolId = user?.school_id;

      // آماده‌سازی داده‌ها برای ارسال
      const payload = {
        ...formData,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}), // اضافه کردن school_id فقط برای ادمین
      };

      // ارسال درخواست POST به اندپوینت
      const response = await api.post(`${endpoints.docs}/full`, payload);
      console.log('DocumentPart8: پاسخ API ارسال سند:', response.data);

      // پاک‌سازی localStorage پس از موفقیت
      localStorage.removeItem('accountingDocumentFormData');

      // هدایت به مسیر /Accounting
      navigate('/Accounting');
      showSuccessNotification('ثبت سند موفقیت آمیز بود');

    } catch (error) {
      console.error('DocumentPart8: خطا در ارسال سند:', error);

      // مدیریت انواع مختلف ارورها
      let errorMessage = 'خطا در ارسال سند به سرور';
      
        if (error.response) {
          // خطاهای دیگر (مثل خطا در تنظیم درخواست)
          errorMessage = error.response.data?.message || 'خطای غیرمنتظره‌ای رخ داد.';
        }

        // نمایش اعلان خطا به کاربر
        showErrorNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className={style.DocumentPart8}>
        <h1>لیست هزینه‌ها را بررسی کنید</h1>
        <div className={style.all}>
          <div className={style.history}>
            <div className={style.title}>
              <div className={style.name}><p>ردیف</p></div>
              <div className={style.name}><p>نوع هزینه</p></div>
              <div className={style.name}><p>جزئیات</p></div>
              <div className={style.name}><p>مبلغ</p></div>
              <div className={style.name}><p>ویرایش</p></div>
              <div className={style.name}><p>حذف</p></div>
            </div>
            <div className={style.table}>
              {records.length > 0 ? (
                records
                  .filter((record) => record.AccountID !== 1 && record.AccountID !==1100) // فیلتر کردن رکورد با AccountID: 1
                  .map((record, index) => (
                    <div key={record.id} className={style.row}>
                      <div className={style.item}><p>{convertToPersianDigits(index + 1)}</p></div>
                      <div className={style.item}><p>{record.AccountTitle || 'نوع هزینه نامشخص'}</p></div>
                      <div className={style.item}>
                        <DynamicTooltip
                          content={
                            record.DocRowDetails?.[0]?.Title ||
                            convertToPersianDigits(record.DocRowDetails?.[0]?.BillNo) ||
                            ''
                          }
                        >
                          <p className={style.textShort}>
                            {record.DocRowDetails?.[0]?.Title ||
                              convertToPersianDigits(record.DocRowDetails?.[0]?.BillNo) ||
                              ''}
                          </p>
                        </DynamicTooltip>
                      </div>
                      <div className={style.item}>
                        <p>
                          {convertToPersianDigits(record.Debtor > 0 ? record.Debtor : record.Creditor)} ریال
                        </p>
                      </div>
                      <button className={style.button} onClick={() => handleEdit(record.id)}>
                        <img src={Pan} alt="edit" />
                      </button>
                      <button className={style.button} onClick={() => handleDelete(record.id)}>
                        <img src={Trash} alt="delete" />
                      </button>
                    </div>
                  ))
              ) : (
                <p className={style.emptyMessage}>رکوردی برای نمایش وجود ندارد.</p>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} className={style.nextButton} disabled={isLoading}>
          {isLoading ? <><LoadingSpinner /></> : <><p>ثبت نهایی</p><img src={Arrow} alt="" style={{ height: '20px' }} /></>}
          
        </button>
        {showConfirm && (
          <QuestionBox
            message="آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    );
  }