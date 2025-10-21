import style from './DocumentPart5.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import Pan from '../../assets/icons/pan.svg';
import Trash from '../../assets/icons/Trash.svg';
import DynamicTooltip from '../../components/DynamicTooltip/DynamicTooltip';
import api, { endpoints } from '../../config/api.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import React, { useState, useEffect } from 'react';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import { showWarningNotification, showSuccessNotification } from '../../services/notificationService.jsx';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx'

export default function DocumentPart5() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();

  // داده‌ها مستقیماً از formData خوانده می‌شوند
  const docType = formData.DocType || '';
  const records = formData.docRows && Array.isArray(formData.docRows) ? formData.docRows : [];

  // state‌های محلی برای مدیریت فرم
  const [expenseType, setExpenseType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [payment, setPayment] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hasWarned, setHasWarned] = useState(false); // برای جلوگیری از هشدارهای تکراری
  const [isEditing, setIsEditing] = useState(false); // Flag to check if in edit mode

  // حداکثر مبلغ مجاز
  const MAX_AMOUNT = 1000000000000;

  // Check if in edit mode by checking localStorage
  useEffect(() => {
    const storedFormData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    if (storedFormData.id) {
      setIsEditing(true);
      // Initialize form fields with stored data if necessary
      updateFormData({ docRows: storedFormData.docRows || [] });
    }
  }, [updateFormData]);

  // تبدیل اعداد فارسی/عربی به انگلیسی
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

  // تبدیل اعداد انگلیسی به فارسی با جداکننده هزارگان
  const formatToPersianNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    let result = Number(convertToEnglishDigits(value.toString())).toLocaleString('en-US', {
      useGrouping: true,
    });
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(i, 'g'), persianDigits[i]);
    }
    return result.replace(/,/g, ',');
  };

  // مدیریت اینپوت فقط عدد برای details در SaveRecievesDoc
  const handleDetailsChange = (e) => {
    const value = e.target.value;
    if (docType === 'SaveRecievesDoc') {
      if (/^[\d۰-۹٠-٩,]*$/.test(value)) {
        const englishValue = convertToEnglishDigits(value);
        if (/^\d*$/.test(englishValue)) {
          setDetails(englishValue ? formatToPersianNumber(englishValue) : '');
        }
      }
    } else {
      setDetails(value);
    }
  };

  // مدیریت اینپوت مبلغ (price)
  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (/^[\d۰-۹٠-٩,]*$/.test(value)) {
      const englishValue = convertToEnglishDigits(value);
      if (/^\d*$/.test(englishValue)) {
        const numericValue = Number(englishValue);
        if (englishValue && numericValue > MAX_AMOUNT) {
          if (!hasWarned) {
            showWarningNotification('مبلغ نمی‌تواند بیشتر از ۱,۰۰۰,۰۰۰,۰۰۰,۰۰۰ باشد');
            setHasWarned(true);
          }
          return;
        }
        if (!englishValue || numericValue <= MAX_AMOUNT) {
          setHasWarned(false);
        }
        setPrice(englishValue ? formatToPersianNumber(englishValue) : '');
      }
    }
  };

  // دریافت لیست حساب‌ها از سرور
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!hasMore || !docType) return;
      setLoading(true);

      try {
        let url = endpoints.accounts;
        if (docType === 'SaveRecievesDoc') {
          url += '?IsRecieve=1';
        } else if (docType === 'savePaymentDoc') {
          url += '?IsCost=1';
        } else if (docType === 'GetMonyForTankhahDoc') {
          url += '?Tankhah=1';
        }
        url += (url.includes('?') ? '&' : '?') + `page=${page}&limit=15`;
        if (searchTerm.trim() !== '') {
          url += `&search=${encodeURIComponent(searchTerm.trim())}`;
        }
        
        const response = await api.get(url);
        const responseData = response.data.data;
        setPayment((prev) => (page === 1 ? responseData : [...prev, ...responseData]));
        setHasMore(responseData.length >= 15);
        console.log('DocumentPart5: حساب‌ها بارگذاری شدند:', responseData);
      } catch (error) {
        console.error('DocumentPart5: خطا در دریافت لیست حساب‌ها:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [page, docType, searchTerm]);

  // تابع لود بیشتر
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // مدیریت افزودن یا ویرایش رکورد
  const handleAddRecord = () => {
    if (!expenseType || !details || !price || !docType) {
      showWarningNotification('لطفاً تمامی فیلدهای مورد نیاز (نوع هزینه، شرح جزئیات/شماره فیش، مبلغ) را پر کنید');
      return;
    }

    const isRecieveDoc = docType === 'SaveRecievesDoc';
    const englishPrice = convertToEnglishDigits(price);

    if (!englishPrice || isNaN(englishPrice)) {
      showWarningNotification('مبلغ نامعتبر است');
      return;
    }

    if (Number(englishPrice) > MAX_AMOUNT) {
      return;
    }

    const newRecordData = {
      id: isEdit ? editId : Date.now(),
      AccountID: expenseType.id,
      AccountTitle: expenseType.title,
      Debtor: isRecieveDoc ? 0 : Number(englishPrice),
      Creditor: isRecieveDoc ? Number(englishPrice) : 0,
      DocRowDetails: [
        {
          amount: Number(englishPrice),
          ...(isRecieveDoc ? { BillNo: convertToEnglishDigits(details) } : { Title: details }),
        },
      ],
    };

    let updatedRecords;
    if (isEdit) {
      updatedRecords = records.map((record) => (record.id === editId ? newRecordData : record));
    } else {
      updatedRecords = [...records, newRecordData];
    }

    updateFormData({ docRows: updatedRecords });
    console.log('DocumentPart5: رکورد جدید یا ویرایش‌شده اضافه شد:', newRecordData);

    setExpenseType('');
    setDetails('');
    setPrice('');
    setEditId(null);
    setIsEdit(false);
    setSearchTerm('');
    setHasWarned(false);
  };

  // مدیریت حذف با تأیید
  const handleDeleteClick = (id) => {
    if (editId === null) {
      setDeleteId(id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    const updatedRecords = records.filter((record) => record.id !== deleteId);
    updateFormData({ docRows: updatedRecords });
    console.log('DocumentPart5: رکورد حذف شد:', deleteId);
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  // به‌روزرسانی searchTerm هنگام انتخاب expenseType
  useEffect(() => {
    if (expenseType) {
      setSearchTerm(expenseType.title);
    }
  }, [expenseType]);

  // محاسبه totalAmount برای SaveRecievesDoc
  const calculateTotalAmount = () => {
    return records.reduce((sum, record) => sum + (record.Creditor || 0), 0);
  };

  // بررسی وجود حداقل یک رکورد و هدایت بر اساس DocType
// ... سایر کدها بدون تغییر ...
const handleButtonClick = async () => {
  if (records.length === 0) {
    showWarningNotification('لطفاً حداقل یک فاکتور اضافه کنید');
    return;
  }

  let updatedRecords = [...records];

  if (isEditing) {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user?.roles?.[0] === 'admin';
      const schoolId = user?.school_id;

      const payload = {
        ...formData,
        docRows: updatedRecords,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
      };

      const response = await api.put(`${endpoints.docs}/${formData.id}`, payload);
      console.log('DocumentPart5: API response for update:', response.data);
      // ذخیره flag برای باز کردن مودال
      localStorage.setItem('openEditModal', 'true');
      // نگذارید localStorage پاک شود
      showSuccessNotification('ویرایش سند موفقیت‌آمیز بود');
      navigate('/Accounting');
    } catch (error) {
      console.error('DocumentPart5: Error updating document:', error);
      let errorMessage = 'خطا در ویرایش سند';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
      }
      showWarningNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  } else {
    if (docType === 'SaveRecievesDoc') {
      const hasAccountID1 = records.some(record => record.AccountID === 1);
      if (!hasAccountID1) {
        const totalAmount = calculateTotalAmount();
        const newRecord = {
          id: Date.now(),
          AccountID: 1,
          Debtor: totalAmount,
          Creditor: 0,
          AccountTitle: 'حساب دریافتی',
        };
        updatedRecords = [...records, newRecord];
        updateFormData({ docRows: updatedRecords });
        console.log('DocumentPart5: رکورد جدید اضافه شد برای SaveRecievesDoc:', newRecord);
      }
      navigate('/Accounting/Document/8');
      console.log('DocumentPart5: هدایت به صفحه ۸ به دلیل SaveRecievesDoc');
    } else {
      goToNextStep();
    }
  }
};

  return (
    <div className={style.DocumentPart5}>
      <h1>نوع هزینه‌ها، شرح جزئیات و مبلغ را انتخاب و وارد کنید</h1>
      <div className={style.all}>
        <div className={style.list}>
          <div className={style.header}>
            <div className={style.right}>
              <p>نوع هزینه:</p>
            </div>
            <div className={style.left} style={{ position: 'relative' }}>
              <div
                className={style.arrowBox}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg width='16' height='16' viewBox='0 0 26 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z'
                    fill='#69b0b2'
                  />
                </svg>
              </div>
              <div
                className={style.displayBox}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <input
                  type='text'
                  placeholder='جستجو کنید...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir='rtl'
                />
              </div>
              {dropdownOpen && (
                <div
                  className={style.dropdownMenu}
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    if (scrollHeight - scrollTop <= clientHeight + 20) {
                      loadMore();
                    }
                  }}
                >
                  {payment.length > 0 &&
                    payment
                      .filter((item) => item?.title)
                      .map((acc, index) => (
                        <div
                          key={`${docType}-${index}-${acc.title}`}
                          className={style.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpenseType({ title: acc.title, id: acc.id });
                            setDropdownOpen(false);
                          }}
                          style={{
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f0f0f0',
                          }}
                        >
                          {acc.title}
                        </div>
                      ))}
                  {loading && (
                    <Skeleton
                      duration={2}
                      highlightColor='#69b0b2'
                      count={2}
                      style={{ margin: '0px 0', borderRadius: '0px', padding: '0px 0' }}
                      height={40}
                    />
                  )}
                  {!hasMore && <p style={{ padding: '0', textAlign: 'center' }}>تمام موارد بارگذاری شد</p>}
                </div>
              )}
            </div>
          </div>

          <div className={style.center}>
            <div className={style.right}>
              <p>{docType === 'savePaymentDoc' ? 'شرح جزئیات:' : 'شماره فیش:'}</p>
            </div>
            <div className={style.left}>
              <textarea
                className={style.detail}
                value={details}
                onChange={handleDetailsChange}
                placeholder={docType === 'SaveRecievesDoc' ? 'فقط عدد وارد کنید' : 'شرح جزئیات را وارد کنید'}
                dir={docType === 'SaveRecievesDoc' ? 'ltr' : 'rtl'}
              />
            </div>
          </div>
          <div className={style.footer}>
            <div className={style.right}>
              <p>مبلغ:</p>
            </div>
            <div className={style.left}>
              <input
                className={style.price}
                value={price}
                onChange={handlePriceChange}
                placeholder='مبلغ را وارد کنید'
                dir='ltr'
              />
            </div>
          </div>
          <div className={style.footercontainer}>
            <button className={style.button} onClick={handleAddRecord}>
              {isEdit ? 'به‌روزرسانی' : 'ثبت'}
            </button>
          </div>
        </div>
        <div className={style.history}>
          <div className={style.title}>
            <div className={style.name}><p>ردیف</p></div>
            <div className={style.name}><p>نوع هزینه</p></div>
            <div className={style.name}><p>{docType === 'savePaymentDoc' ? 'شرح جزئیات' : 'شماره فیش'}</p></div>
            <div className={style.name}><p>مبلغ</p></div>
            <div className={style.name}><p>ویرایش</p></div>
            <div className={style.name}><p>حذف</p></div>
          </div>
          <div className={style.table}>
            {records
              .filter((record) => record.AccountID !== 1 && record.AccountID !== 1100)
              .map((record, index) => (
                <div
                  key={record.id}
                  className={`${style.row} ${editId === record.id ? style.editingRow : ''}`}
                >
                  <div className={style.item}><p>{formatToPersianNumber(index + 1)}</p></div>
                  <div className={style.item}>
                    <p>{record.AccountTitle || 'نوع هزینه نامشخص'}</p>
                  </div>
                  <div className={style.item}>
                    <div className={style.text}>
                      <DynamicTooltip
                        content={record.DocRowDetails?.[0]?.Title || formatToPersianNumber(record.DocRowDetails?.[0]?.BillNo)}
                      >
                        <p className={style.textShort}>
                          {record.DocRowDetails?.[0]?.Title || formatToPersianNumber(record.DocRowDetails?.[0]?.BillNo)}
                        </p>
                      </DynamicTooltip>
                    </div>
                  </div>
                  <div className={style.item}>
                    <p>{formatToPersianNumber(record.Debtor > 0 ? record.Debtor : record.Creditor)} ریال</p>
                  </div>
                  <button
                    className={style.button}
                    onClick={() => {
                      setEditId(record.id);
                      setExpenseType({ id: record.AccountID, title: record.AccountTitle });
                      setDetails(record.DocRowDetails?.[0]?.Title || formatToPersianNumber(record.DocRowDetails?.[0]?.BillNo) || '');
                      setPrice(formatToPersianNumber((record.Debtor > 0 ? record.Debtor : record.Creditor) || ''));
                      setIsEdit(true);
                      setHasWarned(false);
                    }}
                  >
                    <img src={Pan} alt='edit' />
                  </button>
                  <button
                    className={style.button}
                    onClick={() => handleDeleteClick(record.id)}
                  >
                    <img src={Trash} alt='delete' />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <QuestionBox
          message='آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟'
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={false}
        />
      )}
      <button onClick={handleButtonClick} className={style.nextButton} disabled={loading}>
        {loading ? (
          <LoadingSpinner/>
        ) : isEditing ? (
          'تایید'
        ) : (
          <>
            مرحله بعدی <img src={Arrow} alt='' style={{ height: '20px' }} />
          </>
        )}
      </button>
    </div>
  );
}