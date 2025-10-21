import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import style from './Accounting.module.css';
import Header from '../../components/Header/Header.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import Add from '../../assets/icons/add.svg';
import Documents from '../../components/Documents/Documents.jsx';
import MobileError from '../../components/Erorr/Types/MobileErorr.jsx'; // Corrected typo
import PersianNumberFormatter from '../../utils/PersianNumberFormatter.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import QuestionBox from '../../components/QuestionBox/QuestionBox.jsx';
import api, { endpoints } from '../../config/api.js';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.jsx';

const LOCAL_STORAGE_KEY = 'accountingDocumentFormData';

export default function Accounting() {
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showQuestionBox, setShowQuestionBox] = useState(false);
  const [balances, setBalances] = useState('خطا در برقراری ارتباط');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const navigate = useNavigate();

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
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      isAdmin: userData.roles[0] === 'admin',
      schoolId: userData.school_id || null,
    };
  };

  // دریافت موجودی حساب‌ها از سرور
  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoadingBalances(true);
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
        console.log('Accounting: موجودی‌ها بارگذاری شدند:', newBalances);
      } catch (error) {
        console.error('Accounting: خطا در دریافت موجودی حساب‌ها:', error);
        setBalances('خطا در برقراری ارتباط...');
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchBalances();
  }, []);

  // بررسی عرض صفحه برای نمایش خطای موبایل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 620);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (process.env.NODE_ENV === 'production' && isMobile) return <MobileError />;
  if (loading) return null;

  const handleNewDocumentClick = (e) => {
    e.preventDefault();
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedData) {
      setShowQuestionBox(true);
    } else {
      navigate('/Accounting/Document');
    }
  };

  const handleConfirm = () => {
    setShowQuestionBox(false);
    navigate('/Accounting/Document');
  };

  const handleCancel = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log('📌 داده‌های ذخیره‌شده پاک شد.');
    setShowQuestionBox(false);
    navigate('/Accounting/Document');
  };

  return (
    <div className={style.Accounting}>
      <Header />
      <div className="App-Container">
        <Sidebar />
        <div className="Main-Content">
          <div className={style.balance}>
            <div className={style.price}>
              {isLoadingBalances ? (
                <LoadingSpinner />
              ) : (
                <>
                  <h1>
                    حساب مدرسه: {formatToPersianNumber(balances.school_account)} ریال |
                  </h1>
                  <h1>
                    تنخواه: {formatToPersianNumber(balances.petty_cash)} ریال
                  </h1>
                </>
              )}

            </div>
            <a href="/Accounting/Document" onClick={handleNewDocumentClick} className={style.button}>
              <img src={Add} alt="add" />
              <p>سند جدید</p>
            </a>
          </div>
          <Documents />
        </div>
      </div>

      {showQuestionBox && (
        <QuestionBox
          message="یک سند تکمیل نشده پیدا شد. آیا می‌خواهید با آن ادامه دهید؟"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}