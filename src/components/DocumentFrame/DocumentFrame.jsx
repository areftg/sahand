import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from "./DocumentFrame.module.css";
import Arrow from '../../assets/icons/arrow.svg';
import api, { endpoints } from "../../config/api.js";
import { showErrorNotification, showSuccessNotification } from '../../services/notificationService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const FormDataContext = createContext(null);

export const useFormData = () => useContext(FormDataContext);

const LOCAL_STORAGE_KEY = 'accountingDocumentFormData';

export default function DocumentFrame({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error("DocumentFrame: Failed to parse stored form data from localStorage:", error);
      return {};
    }
  });

  // همگام‌سازی formData با localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
      console.log("DocumentFrame: Form data saved to localStorage:", formData);
    } catch (error) {
      console.error("DocumentFrame: Failed to save form data to localStorage:", error);
    }
  }, [formData]);

  // اضافه کردن docRows خاص برای GetMonyForTankhahDoc و ReturnTankhahRemainDoc
  useEffect(() => {
    if (formData.DocType === 'GetMonyForTankhahDoc') {
      const requiredRows = [
        { AccountID: 1, Debtor: 0, Creditor: 0, DocRowDetails: [] },
        { AccountID: 1100, Debtor: 0, Creditor: 0, DocRowDetails: [] },
      ];

      const existingRows = formData.docRows || [];
      const hasRequiredRows = requiredRows.every(reqRow =>
        existingRows.some(row => row.AccountID === reqRow.AccountID)
      );

      if (!hasRequiredRows) {
        const updatedRows = [...existingRows, ...requiredRows.filter(reqRow =>
          !existingRows.some(row => row.AccountID === reqRow.AccountID)
        )];
        setFormData(prevData => ({
          ...prevData,
          docRows: updatedRows,
        }));
        console.log('DocumentFrame: docRows به‌روزرسانی شد برای GetMonyForTankhahDoc:', updatedRows);
      }
    } else if (formData.DocType === 'ReturnTankhahRemainDoc') {
      const requiredRows = [
        {
          AccountID: 1,
          Debtor: 0,
          Creditor: 0,
          DocRowDetails: [{ amount: 0, BillNo: "" }],
        },
        {
          AccountID: 1100,
          Debtor: 0,
          Creditor: 0,
          DocRowDetails: [],
        },
      ];

      const existingRows = formData.docRows || [];
      const hasRequiredRows = requiredRows.every(reqRow =>
        existingRows.some(row => row.AccountID === reqRow.AccountID)
      );

      if (!hasRequiredRows) {
        const updatedRows = [...existingRows, ...requiredRows.filter(reqRow =>
          !existingRows.some(row => row.AccountID === reqRow.AccountID)
        )];
        setFormData(prevData => ({
          ...prevData,
          docRows: updatedRows,
        }));
        console.log('DocumentFrame: docRows به‌روزرسانی شد برای ReturnTankhahRemainDoc:', updatedRows);
      }
    }
  }, [formData.DocType]);

  // تعریف مسیرهای مراحل بر اساس DocType
  const baseStepPaths = [
    '/Accounting/Document',
    '/Accounting/Document/2',
    '/Accounting/Document/3',
    '/Accounting/Document/4',
    '/Accounting/Document/5',
    '/Accounting/Document/6',
    '/Accounting/Document/7',
    '/Accounting/Document/8',
  ];

  const stepPaths = formData.DocType === 'GetMonyForTankhahDoc'
    ? [
        '/Accounting/Document',
        '/Accounting/Document/2',
        '/Accounting/Document/3',
        '/Accounting/Document/4',
        '/Accounting/Document/7',
      ]
    : formData.DocType === 'saveRecievesDoc'
      ? [
          '/Accounting/Document',
          '/Accounting/Document/2',
          '/Accounting/Document/5',
          '/Accounting/Document/8',
        ]
      : formData.DocType === 'ReturnTankhahRemainDoc'
        ? [
            '/Accounting/Document',
            '/Accounting/Document/2',
            '/Accounting/Document/3',
            '/Accounting/Document/4',
          ]
        : baseStepPaths;

  const currentPathIndex = stepPaths.indexOf(location.pathname);

  // تنظیم تعداد کل مراحل و شماره مرحله
  const totalSteps = formData.DocType === 'GetMonyForTankhahDoc'
    ? 5
    : formData.DocType === 'saveRecievesDoc'
      ? 4
      : formData.DocType === 'ReturnTankhahRemainDoc'
        ? 4
        : (formData.accountType === 'petty_cash' && location.pathname === '/Accounting/Document/8')
          ? 7
          : stepPaths.length;

  const currentStepNumber = currentPathIndex + 1;

  const gotohome = () => {
    navigate("/Accounting");
  };

  const goToPreviousStep = () => {
    if (currentPathIndex > 0) {
      if (formData.DocType === 'GetMonyForTankhahDoc' && location.pathname === '/Accounting/Document/7') {
        navigate('/Accounting/Document/4');
        console.log('DocumentFrame: بازگشت به صفحه ۴ به دلیل GetMonyForTankhahDoc');
      } else if (location.pathname === '/Accounting/Document/8' && formData.accountType === 'petty_cash') {
        navigate('/Accounting/Document/6');
        console.log('DocumentFrame: بازگشت به صفحه ۶ به دلیل انتخاب تنخواه');
      } else if (location.pathname === '/Accounting/Document/8' && formData.DocType === 'saveRecievesDoc') {
        navigate('/Accounting/Document/5');
        console.log('DocumentFrame: بازگشت به صفحه ۵ به دلیل saveRecievesDoc');
      } else {
        navigate(stepPaths[currentPathIndex - 1]);
        console.log('DocumentFrame: بازگشت به:', stepPaths[currentPathIndex - 1]);
      }
    }
  };

  const updateFormData = (newData) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, ...newData };
      console.log('DocumentFrame: formData به‌روزرسانی شد:', updatedData);
      return updatedData;
    });
  };

  const goToNextStep = async () => {
    if (currentPathIndex < stepPaths.length - 1) {
      navigate(stepPaths[currentPathIndex + 1]);
      console.log('DocumentFrame: رفتن به:', stepPaths[currentPathIndex + 1]);
    } else {
      setIsLoading(true);
      console.log('DocumentFrame: فرم نهایی شد! اطلاعات:', formData);
      try {
        if (!formData || !formData.docRows || !formData.DocType) {
          throw new Error('داده‌های فرم نامعتبر است یا وجود ندارد');
        }
        if (!formData.docRows.length) {
          throw new Error('هیچ رکوردی برای ثبت سند وجود ندارد.');
        }
        if (
          (formData.DocType === 'savePaymentDoc' || formData.DocType === 'GetMonyForTankhahDoc') &&
          formData.accountType === 'cheque' &&
          (!formData.chequeIds || formData.chequeIds.length === 0)
        ) {
          throw new Error('شناسه چک برای نوع سند انتخاب‌شده الزامی است');
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user?.roles?.[0] === 'admin';
        const schoolId = user?.school_id;

        const payload = {
          ...formData,
          chequeIds: formData.chequeIds || [],
          ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
        };

        console.log('DocumentFrame: payload ارسالی به API:', payload);

        const response = await api.post(`${endpoints.docs}/full`, payload);
        console.log('DocumentFrame: پاسخ API ارسال سند:', response.data);

        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log('DocumentFrame: Form data cleared from localStorage after final submission.');

        navigate('/Accounting');
        showSuccessNotification('ثبت سند موفقیت‌آمیز بود');
      } catch (error) {
        console.error('DocumentFrame: خطا در ارسال سند:', error);
        let errorMessage = 'خطا در ارسال سند به سرور';
        if (error.response) {
          errorMessage = error.response.data?.message || error.message || 'خطای غیرمنتظره‌ای رخ داد.';
        }
        showErrorNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData, goToNextStep }}>
      <div>
        <div className={style.conbutton}>
          {currentPathIndex > 0 && (
            <button className={style.button} onClick={goToPreviousStep} disabled={isLoading}>
              <img src={Arrow} alt='' style={{ rotate: "180deg", height: "30px" }} />
              مرحله قبلی
            </button>
          )}
          <button className={style.button} onClick={gotohome} disabled={isLoading}>
            <img src={Arrow} alt='' style={{ rotate: "180deg", height: "30px" }} />
            بازگشت به صفحه اصلی
          </button>
        </div>
        <div className={style.content}>
          {isLoading && <LoadingSpinner />}
          {children}
        </div>
        <div className={style.constep}>
          <div>
            <div className={style.step}>
              مرحله: <span style={{ fontSize: '33px', color: 'black', margin: '0 5px' }}>{currentStepNumber}</span>
              <span style={{ fontSize: '25px', color: '#ccc', margin: '0 5px' }}>/</span>
              <span style={{ fontSize: '25px', color: '#666' }}>{totalSteps}</span>
            </div>
          </div>
        </div>
      </div>
    </FormDataContext.Provider>
  );
}