import styles from './DocumentPart7.module.css';
import Meetings from '../Meetings/Meetings';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import { useState, useEffect } from 'react';
import api, { endpoints } from '../../config/api';
import { showErrorNotification, showWarningNotification, showSuccessNotification } from '../../services/notificationService';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import moment from 'jalali-moment';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import Arrow from '../../assets/icons/Drop.svg';
import QuestionBox from '../../components/QuestionBox/QuestionBox';

export default function DocumentPart7({ onSelectCheque, minAmount, maxAmount, onClose }) {
  const context = useFormData();
  const goToNextStep = context ? context.goToNextStep : null;
  const navigate = useNavigate();
  const [selectedCheq, setSelectedCheq] = useState('');
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [cheqs, setCheqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActionConfirm, setShowActionConfirm] = useState(false);

  // Check if in edit mode by checking localStorage
  useEffect(() => {
    const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    if (formData.id) {
      setIsEditing(true);
      const chequeIds = formData.chequeIds || [];
      if (chequeIds.length > 0) {
        setSelectedCheq(chequeIds[0]);
        console.log('DocumentPart7: مقدار اولیه selectedCheq از localStorage:', chequeIds[0]);
      }
    }
  }, []);

  const toPersianDigits = (str) => {
    if (!str || typeof str !== 'string') return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return str.replace(new RegExp(`[${englishDigits}]`, 'g'), (d) => persianDigits[englishDigits.indexOf(d)]);
  };

  const formatAmount = (amount) => {
    if (!amount) return '۰ ریال';
    const formattedAmount = Number(amount).toLocaleString('fa-IR');
    return `${toPersianDigits(formattedAmount)} ریال`;
  };

  const formatDate = (date) => {
    if (!date || date === '') return '';
    const parsedDate = moment(date, ['YYYY-MM-DD', 'jYYYY-jMM-jDD']);
    if (!parsedDate.isValid()) return '';
    return toPersianDigits(parsedDate.format('jYYYY/jMM/jDD'));
  };

  const calculateMinMax = () => {
    if (minAmount !== undefined && maxAmount !== undefined) {
      const minNum = Number(minAmount) || 0;
      const maxNum = Number(maxAmount) || 0;
      if (minNum === 0 && maxNum === 0) return null;
      return { min_amount: minNum, max_amount: maxNum };
    }

    const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    const docRowss = formData.docRows || [];
    let total = 0;
    docRowss.forEach((row) => {
      if (row.AccountID != 1) {
        const debtor = parseFloat(row.Debtor) || 0;
        const creditor = parseFloat(row.Creditor) || 0;
        total += debtor + creditor;
      }
    });

    if (total === 0) return null;
    return { min_amount: total, max_amount: total };
  };

  const fetchCheques = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id || '1';

      const range = calculateMinMax();
      const params = new URLSearchParams();
      if (isAdmin) params.append('school_id', schoolId);
      if (range) {
        params.append('amount[min]', String(range.min_amount));
        params.append('amount[max]', String(range.max_amount));
      }
      params.append('is_unassigned', '1');

      const url = `${endpoints.cheques}?${params.toString()}`;
      const response = await api.get(url);
      console.log('DocumentPart7: پاسخ API چک‌ها:', response.data);
      setCheqs(response.data.data || []);
    } catch (error) {
      console.error('DocumentPart7: خطا در دریافت چک‌ها:', error);
      const errorMessage = error.response?.data?.message || 'خطا در دریافت لیست چک‌ها';
      showErrorNotification(errorMessage);
      setCheqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, [minAmount, maxAmount]);

  const updateLocalStorage = (chequeId, action = 'create') => {
    const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    if (action === 'replace') {
      formData.chequeIds = [chequeId];
      delete formData.ebtalChequeIds; // پاک کردن ebtalChequeIds در حالت جایگزینی
    } else if (action === 'deleteCheque') {
      formData.chequeIds = [];
      formData.ebtalChequeIds = [{ id: chequeId, reason: 'مخدوش شدن چک قبلی و جایگزینی با چک جدید' }];
    } else {
      formData.chequeIds = [chequeId];
      delete formData.ebtalChequeIds; // پاک کردن ebtalChequeIds در حالت ایجاد
    }
    localStorage.setItem('accountingDocumentFormData', JSON.stringify(formData));
    console.log('DocumentPart7: به‌روزرسانی localStorage:', formData);
  };

  const handleChequeSelection = (chequeId) => {
    console.log('DocumentPart7: انتخاب چک با ID:', chequeId);
    setSelectedCheq(chequeId);
    // به‌روزرسانی موقت localStorage برای انتخاب چک
    updateLocalStorage(chequeId, isEditing ? 'replace' : 'create');
  };

  const closeModal = () => {
    setIsMeetingsOpen(false);
    fetchCheques();
    if (onClose) onClose();
  };

  const handleButtonClick = async () => {
    console.log('DocumentPart7: handleButtonClick - selectedCheq:', selectedCheq);
    if (!selectedCheq) {
      showWarningNotification('لطفاً یک چک را انتخاب کنید');
      return;
    }
    setIsConfirmLoading(true);

    try {
      if (isEditing) {
        // نمایش مودال برای انتخاب عملیات در حالت ویرایش
        setShowActionConfirm(true);
      } else {
        // حالت ایجاد: فقط chequeIds تنظیم می‌شود
        updateLocalStorage(selectedCheq, 'create');
        if (onSelectCheque) {
          console.log('DocumentPart7: فراخوانی onSelectCheque با:', selectedCheq);
          await onSelectCheque(selectedCheq);
        } else if (goToNextStep) {
          console.log('DocumentPart7: فراخوانی goToNextStep');
          await goToNextStep();
        } else {
          showErrorNotification('عملکرد مرحله بعدی در دسترس نیست');
        }
      }
    } catch (error) {
      console.error('DocumentPart7: خطا در تأیید:', error);
      let errorMessage = 'خطا در انجام عملیات تأیید';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
      }
      showErrorNotification(errorMessage);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleVoidOptionSelectReplace = () => {
    try {
      // به‌روزرسانی localStorage برای جایگزینی
      updateLocalStorage(selectedCheq, 'replace');

      // تنظیم flag برای باز کردن EditDocModal
      localStorage.setItem('openEditModal', 'true');
      showSuccessNotification('اطلاعات سند به‌روزرسانی شد');
      navigate('/Accounting');
    } catch (error) {
      console.error('DocumentPart7: خطا در جایگزینی چک:', error);
      showErrorNotification('خطا در به‌روزرسانی اطلاعات سند');
    } finally {
      setIsConfirmLoading(false);
      setShowActionConfirm(false);
    }
  };

  const handleVoidOptionSelectDeleteCheque = () => {
    try {
      // به‌روزرسانی localStorage برای حذف چک
      updateLocalStorage(selectedCheq, 'deleteCheque');

      // تنظیم flag برای باز کردن EditDocModal
      localStorage.setItem('openEditModal', 'true');
      showSuccessNotification('اطلاعات سند به‌روزرسانی شد');
      navigate('/Accounting');
    } catch (error) {
      console.error('DocumentPart7: خطا در حذف چک:', error);
      showErrorNotification('خطا در حذف چک');
    } finally {
      setIsConfirmLoading(false);
      setShowActionConfirm(false);
    }
  };

  const content = (
    <div className={styles.all}>
      <div className={styles.header}>
        <div className={styles.left}>
          <h2>چک مربوطه را انتخاب کنید.</h2>
        </div>
        <div className={styles.right}>
          <button onClick={() => setIsMeetingsOpen(true)}>
            افزودن چک جدید
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.cheqs}>
          {Array(8)
            .fill()
            .map((_, index) => (
              <Skeleton
                key={index}
                duration={2}
                highlightColor="#69b0b2"
                baseColor="#e0e0e0"
                height={56}
                style={{ margin: '0', borderRadius: '6px', width: '100%' }}
              />
            ))}
        </div>
      ) : cheqs.length === 0 ? (
        <div className={styles.cheqs}>
          <p>هیچ چکی یافت نشد.</p>
        </div>
      ) : (
        <div className={styles.cheqs}>
          {cheqs.map((cheq) => (
            <label htmlFor={cheq.id} className={styles.cheq} key={cheq.id}>
              <input
                type="radio"
                id={cheq.id}
                className={styles.customradio}
                name="cheq"
                value={cheq.id}
                checked={selectedCheq === cheq.id}
                onChange={() => handleChequeSelection(cheq.id)}
              />
              <p>{formatDate(cheq.issueDate)}</p>
              <p>{formatAmount(cheq.amount)}</p>
              <p>{cheq.recieverName}</p>
            </label>
          ))}
        </div>
      )}

      <div className={styles.buttonContainer}>
        {onSelectCheque && (
          <button className={styles.cancelButton} onClick={onClose}>
            لغو
          </button>
        )}
        <button
          className={styles.nextButton}
          onClick={handleButtonClick}
          disabled={isLoading || isConfirmLoading}
        >
          {isConfirmLoading ? (
            <LoadingSpinner size="small" />
          ) : isEditing ? (
            'تأیید'
          ) : (
            onSelectCheque ? 'تأیید' : (
              <>
                مرحله بعدی <img src={Arrow} alt='' style={{ height: '20px' }} />
              </>
            )
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={onSelectCheque ? styles.modalContainer : styles.DocumentPart7}>
      {onSelectCheque && (
        <div className={styles.modalBackdrop} onClick={onClose}></div>
      )}
      <div className={onSelectCheque ? styles.modalContent : ''}>
        {content}
      </div>
      {isMeetingsOpen && <Meetings onClose={closeModal} />}
      {showActionConfirm && (
        <QuestionBox
          message="برای مشخص سازی وضعیت چک متصل به سند، یکی از گزینه‌ها را انتخاب کنید:"
          onConfirm={handleVoidOptionSelectReplace}
          onCancel={handleVoidOptionSelectDeleteCheque}
          isLoading={isConfirmLoading}
          confirmText="تعلیق، ثبت چک جدید"
          cancelText="ابطال، ثبت چک جدید"
          loadingComponent={<LoadingSpinner />}
        />
      )}
    </div>
  );
}