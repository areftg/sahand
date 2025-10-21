import React, { useState, useEffect } from 'react';
import style from './AddCheck.module.css';
import Close from '../../assets/icons/close.svg';
import api, { endpoints } from '../../config/api';
import { showSuccessNotification, showErrorNotification } from '../../services/notificationService';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const convertPersianToEnglishNumbers = (input) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = input ? input.toString() : '';
  persianNumbers.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), englishNumbers[index]);
  });
  return result;
};

const convertEnglishToPersianNumbers = (input) => {
  if (input === null || input === undefined || input === '') return '';
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = input.toString();
  englishNumbers.forEach((english, index) => {
    result = result.replace(new RegExp(english, 'g'), persianNumbers[index]);
  });
  return result;
};

const AddCheck = ({ isOpen, onClose, onSuccess }) => {
  const [showBranchSettings, setShowBranchSettings] = useState(false);
  const [title, setTitle] = useState('');
  const [startSerial, setStartSerial] = useState('');
  const [endSerial, setEndSerial] = useState('');
  const [bankAccount, setBankAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const numberOfCheques = startSerial && endSerial && !isNaN(convertPersianToEnglishNumbers(startSerial)) && !isNaN(convertPersianToEnglishNumbers(endSerial))
    ? parseInt(convertPersianToEnglishNumbers(endSerial)) - parseInt(convertPersianToEnglishNumbers(startSerial)) + 1
    : 0;

  useEffect(() => {
    const storedBankAccounts = localStorage.getItem('bankAccounts');
    if (storedBankAccounts) {
      const accounts = JSON.parse(storedBankAccounts);
      console.log('AddCheck: Bank accounts from localStorage:', accounts);
      setBankAccount(accounts[0] || null);
    } else {
      fetchBankAccounts();
    }
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get(endpoints.bankaccounts);
      console.log('AddCheck: Raw bank accounts data from server:', response.data);
      const accounts = response.data.data || response.data || [];
      if (accounts.length > 0) {
        setBankAccount(accounts[0]);
        localStorage.setItem('bankAccounts', JSON.stringify(accounts));
        console.log('AddCheck: Bank account set:', accounts[0]);
      } else {
        showErrorNotification('هیچ شماره حسابی یافت نشد.');
        console.log('AddCheck: No accounts found in server response.');
      }
    } catch (error) {
      console.error('AddCheck: Error fetching bank accounts:', error);
      showErrorNotification('خطا در دریافت شماره حساب‌ها. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleStartSerialChange = (e) => {
    const value = convertPersianToEnglishNumbers(e.target.value);
    setStartSerial(value);
  };

  const handleEndSerialChange = (e) => {
    const value = convertPersianToEnglishNumbers(e.target.value);
    setEndSerial(value);
  };

  const handleSubmit = () => {
    if (!title.trim() || !startSerial || !endSerial || !bankAccount) {
      showErrorNotification('تمام فیلدها باید پر شوند.');
      console.log('AddCheck: Validation error:', { title, startSerial, endSerial, bankAccount });
      return;
    }
    const start = parseInt(convertPersianToEnglishNumbers(startSerial));
    const end = parseInt(convertPersianToEnglishNumbers(endSerial));
    if (end < start) {
      showErrorNotification('شماره سریال پایان باید بزرگ‌تر سریال شروع باشد.');
      return;
    }
    if (numberOfCheques <= 0) {
      showErrorNotification('تعداد چک‌ها باید بیشتر از صفر باشد.');
      return;
    }

    addChequebook();
  };

  const addChequebook = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = userData.roles[0] === 'admin';
      const schoolId = isAdmin ? userData.school_id : undefined;

      const payload = {
        Title: title.trim(),
        StartSerialNo: parseInt(convertPersianToEnglishNumbers(startSerial)),
        EndSerialNo: parseInt(convertPersianToEnglishNumbers(endSerial)),
        AccountID: bankAccount?.id,
        ...(isAdmin && schoolId ? { school_id: schoolId } : {}),
        IsActive: false,
      };
      console.log('AddCheck: Sending to API:', payload);
      const response = await api.post(endpoints.chequebooks, payload);
      console.log('AddCheck: API response for adding chequebook:', response.data);
      showSuccessNotification('دسته‌چک با موفقیت اضافه شد.');
      setTitle('');
      setStartSerial('');
      setEndSerial('');
      onClose(false);
      if (onSuccess) {
        console.log('AddCheck: Calling onSuccess');
        onSuccess();
      }
    } catch (error) {
      console.error('AddCheck: Error adding chequebook:', error);
      const message =
        error.response?.data?.errors?.StartSerialNo?.[0] ||
        error.response?.data?.message ||
        error.message ||
        'خطا در افزودن دسته‌چک. لطفاً دوباره تلاش کنید.';
      showErrorNotification(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={style.container}>
      <div className={style.modal}>
        {!showBranchSettings && (
          <>
            <div className={style.header}>
              <div onClick={() => onClose(false)} className={style.checkbox}>
                <img src={Close} alt="بستن" />
              </div>
              <h2 className={style.title}>افزودن دسته چک جدید!</h2>
            </div>
            <div className={style.box}>
              <div className={style.item}>
                <p className={style.placeholder}>شماره حساب:</p>
                <div className={style.score}>
                  <p>
                    {bankAccount
                      ? `${convertEnglishToPersianNumbers(bankAccount.bank_account_no)} - ${bankAccount.bank_name}`
                      : 'در حال بارگذاری...'}
                  </p>
                </div>
              </div>
              <div className={style.item}>
                <p className={style.placeholder}>عنوان دسته چک:</p>
                <div className={style.score}>
                  <input
                    type="text"
                    className={style.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="عنوان دسته‌چک"
                  />
                </div>
              </div>
              <div className={style.item}>
                <p className={style.placeholder}>شماره سریال شروع:</p>
                <div className={style.score}>
                  <input
                    type="text"
                    className={style.input}
                    value={startSerial ? convertEnglishToPersianNumbers(startSerial) : ''}
                    onChange={handleStartSerialChange}
                    placeholder="سریال شروع"
                  />
                </div>
              </div>
              <div className={style.item}>
                <p className={style.placeholder}>شماره سریال پایان:</p>
                <div className={style.score}>
                  <input
                    type="text"
                    className={style.input}
                    value={endSerial ? convertEnglishToPersianNumbers(endSerial) : ''}
                    onChange={handleEndSerialChange}
                    placeholder="سریال پایان"
                  />
                </div>
              </div>
            </div>
            <p>
              تعداد چک‌ها بر اساس سریال: <span>{convertEnglishToPersianNumbers(numberOfCheques)}</span>
            </p>
            <div className={style.footer}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <button
                  className={style.button}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  تأیید
                </button>
              )}
            </div>
          </>
        )}
        {/* {showBranchSettings && (
          <div className={style.branchSettings}>
            <div className={style.header}>
              <div onClick={() => onClose(false)} className={style.checkbox}>
                <img src={Close} alt="بستن" />
              </div>
              <h2 className={style.title}>اطلاعات حساب و تنظیم شماره حساب</h2>
            </div>
            <div className={style.title1}>
              <div className={style.item1}><p>ردیف</p></div>
              <div className={style.item1}><p>کد حساب</p></div>
              <div className={style.item1}><p>نام حساب</p></div>
              <div className={style.item1}><p>نام بانک</p></div>
              <div className={style.item1}><p>شعبه</p></div>
              <div className={style.item1}><p>شماره حساب</p></div>
            </div>
            <div className={style.title2}>
              <div className={style.item2}><p>{convertEnglishToPersianNumbers(1)}</p></div>
              <input type="number" className={style.item2} />
              <input className={style.item2} />
              <input className={style.item2} />
              <input className={style.item2} />
              <input type="number" className={style.item2} />
            </div>
            <div className={style.footer}>
              <button
                className={style.button1}
                onClick={() => setShowBranchSettings(false)}
              >
                تأیید
              </button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AddCheck;