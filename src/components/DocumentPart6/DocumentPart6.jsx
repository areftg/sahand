import style from './DocumentPart6.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showWarningNotification } from '../../services/notificationService.jsx';
import api, { endpoints } from '../../config/api.js';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx'

export default function DocumentPart6() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();

  // Initialize state from formData using a UNIQUE key 'accountType'
  const [selectedOption, setSelectedOption] = useState(formData.accountType || null);
  const [balances, setBalances] = useState({ school_account: null, petty_cash: null }); // برای ذخیره موجودی‌ها
  const [loading, setLoading] = useState(false);

  const docType = formData.DocType || '';
  const records = formData.docRows && Array.isArray(formData.docRows) ? formData.docRows : [];

  // تابع تبدیل اعداد به فرمت فارسی با جداکننده هزارگان
  const formatToPersianNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '۰';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    let result = Number(value).toLocaleString('en-US', { useGrouping: true });
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(i, 'g'), persianDigits[i]);
    }
    return result.replace(/,/g, ',');
  };

  // دریافت اطلاعات کاربر از localStorage
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      isAdmin: user.roles[0] === 'admin',
      schoolId: user.school_id || null,
    };
  };

  // دریافت موجودی حساب‌ها از سرور
  useEffect(() => {
    const fetchBalances = async () => {
      setLoading(true);
      const { isAdmin, schoolId } = getUserInfo();

      try {
        const balancePromises = [
          { id: 'school_account', type: 'school' },
          { id: 'petty_cash', type: 'tankhah' },
        ].map(async ({ id, type }) => {
          let url = `${endpoints.accounts}/balance?type=${type}`;
          if (isAdmin && schoolId) {
            url += `&school_id=${schoolId}`;
          }
          const response = await api.get(url);
          return { id, balance: response.data.data || 0 };
        });

        const results = await Promise.all(balancePromises);
        const newBalances = results.reduce((acc, { id, balance }) => {
          acc[id] = balance;
          return acc;
        }, {});
        setBalances(newBalances);
        console.log('DocumentPart6: موجودی‌ها بارگذاری شدند:', newBalances);
      } catch (error) {
        console.error('DocumentPart6: خطا در دریافت موجودی حساب‌ها:', error);
        setBalances({ school_account: 0, petty_cash: 0 }); // در صورت خطا، صفر نمایش داده شود
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  // موقع لود صفحه، docRows رو فیلتر کن تا فقط رکوردهای فاکتورها باقی بمونه
  useEffect(() => {
    console.log('DocumentPart6: لود صفحه ۶ - docRows فعلی:', records);
    // فقط رکوردهایی که AccountID آنها 1 یا 1100 نیست رو نگه دار
    const validRecords = records.filter(
      (record) => ![1, 1100].includes(record.AccountID)
    );
    updateFormData({ docRows: validRecords, accountType: null });
    console.log('DocumentPart6: docRows بعد از فیلتر:', validRecords);
    setSelectedOption(null); // ریست انتخاب گزینه
  }, []); // فقط یک‌بار موقع لود صفحه اجرا بشه

  const options = [
    { id: 'school_account', title: 'حساب مدرسه' },
    { id: 'petty_cash', title: 'تنخواه' },
  ];

  // تابع محاسبه جمع مبالغ فاکتورها
  const calculateTotalAmount = () => {
    console.log('DocumentPart6: records قبل از محاسبه:', records);
    let total = 0;
    records.forEach((row) => {
      if (row.AccountID !== 1 && row.AccountID !== 1100) { // فقط رکوردهای فاکتورها
        const debtor = parseFloat(row.Debtor) || 0;
        const creditor = parseFloat(row.Creditor) || 0;
        total += debtor + creditor;
        console.log('DocumentPart6: row:', row, 'debtor:', debtor, 'creditor:', creditor, 'total so far:', total);
      }
    });
    console.log('DocumentPart6: totalAmount:', total);
    return total;
  };

  const handleSelect = (option) => {
    setSelectedOption(option.id);
    // Save accountType to formData
    updateFormData({ accountType: option.id });
    console.log('DocumentPart6: گزینه انتخاب شد:', option.id);

    // محاسبه جمع کل
    const totalAmount = calculateTotalAmount();

    // ایجاد رکورد جدید بر اساس selectedOption و docType
    const newRecord = {
      id: Date.now(), // Generate unique ID
      AccountID: option.id === 'petty_cash' ? 1100 : 1,
      Debtor: docType === 'SaveRecievesDoc' ? totalAmount : 0,
      Creditor: docType === 'savePaymentDoc' ? totalAmount : 0,
      AccountTitle: option.title,
    };

    // Remove existing record with AccountID: 1 or 1100 to avoid duplicates
    const filteredRecords = records.filter(
      (record) => ![1, 1100].includes(record.AccountID)
    );
    console.log('DocumentPart6: filteredRecords:', filteredRecords);

    // Update docRows with new record
    updateFormData({
      docRows: [...filteredRecords, newRecord],
    });

    console.log('DocumentPart6: رکورد جدید اضافه شد:', newRecord);
  };

  const handleNextStep = () => {
    if (!selectedOption) {
      showWarningNotification('لطفاً یکی از حساب‌ها (حساب مدرسه یا تنخواه) را انتخاب کنید');
      console.warn('DocumentPart6: هیچ گزینه‌ای انتخاب نشده است.');
      return;
    }
  
    // دریافت accountingDocumentFormData از localStorage
    const accountingFormData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    const docRows = accountingFormData.docRows && Array.isArray(accountingFormData.docRows) 
      ? accountingFormData.docRows 
      : [];
  
    // محاسبه مجموع Creditor در docRows
    const totalCreditor = docRows.reduce((sum, row) => {
      const creditor = parseFloat(row.Creditor) || 0;
      return sum + creditor;
    }, 0);
  
    // بررسی موجودی حساب انتخاب‌شده
    const selectedBalance = balances[selectedOption] || 0;
    if (totalCreditor > selectedBalance) {
      showWarningNotification(
        `مقدار برداشت (${formatToPersianNumber(totalCreditor)} ریال) بیشتر از موجودی حساب ${options.find(opt => opt.id === selectedOption)?.title} (${formatToPersianNumber(selectedBalance)} ریال) است.`
      );
      console.warn('DocumentPart6: مقدار Creditor بیشتر از موجودی حساب است.', {
        totalCreditor,
        selectedBalance,
      });
      return;
    }
  
    // انتقال به مرحله بعدی
    if (selectedOption === 'petty_cash') {
      navigate('/Accounting/Document/8'); // Skip to step 8
    } else {
      goToNextStep(); // Go to step 7
    }
  };

  return (
    <div className={style.DocumentPart6}>
      <h1>حساب برداشت را انتخاب کنید</h1>
      <div className={style.list}>
        {options.map((option) => (
          <div
            key={option.id}
            className={style.option}
            onClick={() => handleSelect(option)}
          >
            <div className={style.circle}>
              {selectedOption === option.id && <div className={style.dot}></div>}
            </div>
            <div className={style.title}>{option.title}</div>
            <div className={style.price}>
              {loading ? (
                <p><LoadingSpinner/></p>
              ) : (
                <p>
                  {balances[option.id] !== null
                    ? `${formatToPersianNumber(balances[option.id])} ریال`
                    : '۰ ریال'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className={style.nextButton} onClick={handleNextStep}>
        مرحله بعدی <img src={Arrow} alt='' style={{ height: '20px' }} />
      </button>
    </div>
  );
}