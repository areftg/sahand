  import React, { useState, useEffect, useCallback } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import style from './Cheq.module.css';
  import ShamsiDatePicker from '../Calendar/ShamsiDatePicker';
  import calenderIcon from '../../assets/icons/Calender.svg';
  import api, { endpoints } from '../../config/api';
  import moment from 'jalali-moment';
  import QuestionBox from '../../components/QuestionBox/QuestionBox';
  import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
  import { showSuccessNotification, showErrorNotification } from '../../services/notificationService';
  import PropTypes from 'prop-types';

  // تبدیل ارقام پارسی/عربی به انگلیسی
  const toEnglishDigits = (str) => {
    if (!str || typeof str !== 'string') return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const englishDigits = '0123456789';
    return str
      .replace(new RegExp(`[${persianDigits}]`, 'g'), (d) => englishDigits[persianDigits.indexOf(d)])
      .replace(new RegExp(`[${arabicDigits}]`, 'g'), (d) => englishDigits[arabicDigits.indexOf(d)]);
  };

  // تبدیل ارقام انگلیسی به پارسی
  const toPersianDigits = (str) => {
    str = String(str ?? '');
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return str.replace(/[0-9]/g, (d) => persianDigits[+d]);
  };

  // قالب‌بندی تاریخ برای نمایش
  const formatDateForDisplay = (date) => {
    if (!date || typeof date !== 'string') return '';
    const parsedDate = moment(date, 'jYYYYjMMjDD', true);
    return parsedDate.isValid() ? toPersianDigits(parsedDate.format('jYYYY/jMM/jDD')) : '';
  };

  function Cheq({ setShowCheq, editMode, initialData, meetingId, onSubmit, isModal = true, fromPage, onClose }) {
    const data = localStorage.getItem("accountingDocumentFormData");
    const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]');
    const [isIssueDatePickerOpen, setIsIssueDatePickerOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(initialData?.role || '');
    const [cheqData, setCheqData] = useState({
      cheque_book_id: initialData?.cheque_book_id || localStorage.getItem('activeChequebookId') || '',
      serialNo: initialData?.serialNo || '',
      amount: initialData?.amount || '',
      issueDate: initialData?.issueDate || '',
      recieverName: initialData?.recieverName || '',
      recieverBankNo: initialData?.recieverBankNo || '',
      recieverBankName: initialData?.recieverBankName || '',
      recieverBankBranch: initialData?.recieverBankBranch || '',
      session_id: meetingId || localStorage.getItem('session_id') || '',
      bank_account_id: bankAccounts[0]?.id || '',
      id: initialData?.id || '',
    });
    const [questionType, setQuestionType] = useState(null);
    const [loadingStates, setLoadingStates] = useState({
      chequeData: false,
      sessionId: false,
      serialNo: false,
    });
    const [serialNoStatus, setSerialNoStatus] = useState('initial');
    const [serverSerialNo, setServerSerialNo] = useState('');
    const [useDocRowsAmount, setUseDocRowsAmount] = useState(false); // حالت جدید برای استفاده از مبلغ سند

    const navigate = useNavigate();
    const location = useLocation();

    // اعتبارسنجی داده‌های چک بر اساس نقش
    const isCheqDataFilled = useCallback((data, role) => {
      if (role === 'buyer') {
        return data.serialNo && data.amount && data.issueDate && data.recieverName;
      } else if (role === 'seller') {
        return (
          data.serialNo &&
          data.amount &&
          data.issueDate &&
          data.recieverName &&
          data.recieverBankNo &&
          data.recieverBankName &&
          data.recieverBankBranch
        );
      }
      return false;
    }, []);

    // بررسی وجود مقدار در getDocRowsTotalAmount و نمایش QuestionBox
    useEffect(() => {
      const totalAmount = getDocRowsTotalAmount();
      if (totalAmount && !editMode && !cheqData.amount && !questionType) {
        setQuestionType('askUseDocRowsAmount');
      }
    }, [editMode, cheqData.amount]);

    // دریافت داده‌های چک در حالت ویرایش
    useEffect(() => {
      const chequeId = localStorage.getItem('cheque_id');
      if (editMode && chequeId) {
        const fetchChequeData = async () => {
          setLoadingStates((prev) => ({ ...prev, chequeData: true }));
          try {
            const response = await api.get(`${endpoints.cheques}/${chequeId}`);
            const data = response.data.data;
            setCheqData({
              cheque_book_id: data.chequebookId || localStorage.getItem('activeChequebookId') || '',
              serialNo: data.serialNumber || '',
              amount: data.amount || '',
              issueDate: data.issueDate || '',
              recieverName: data.recieverName || '',
              recieverBankNo: data.recieverBankNo || '',
              recieverBankName: data.recieverBankName || '',
              recieverBankBranch: data.recieverBankBranch || '',
              session_id: meetingId || localStorage.getItem('session_id') || '',
              bank_account_id: bankAccounts[0]?.id || '',
              id: data.id || '',
            });
            setSelectedRole(data.recieverBankNo ? 'seller' : 'buyer');
            setServerSerialNo(data.serialNumber || '');
            setSerialNoStatus('success');
          } catch (error) {
            showErrorNotification('خطا در بارگذاری اطلاعات چک.');
            console.error('Error fetching cheque data:', error);
          } finally {
            setLoadingStates((prev) => ({ ...prev, chequeData: false }));
          }
        };
        fetchChequeData();
      }
    }, [editMode, meetingId, bankAccounts]);

    // دریافت session ID در صورت عدم وجود
    useEffect(() => {
      const fetchSessionId = async () => {
        setLoadingStates((prev) => ({ ...prev, sessionId: true }));
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const isAdmin = user?.roles === 'admin';

          const url = isAdmin
            ? `${endpoints.meets}/Latest-SessionNo?school_id=${user.school_id || '1'}`
            : `${endpoints.meets}/Latest-SessionNo`;
          const response = await api.get(url);
          const { session_id } = response.data.data;
          localStorage.setItem('session_id', session_id);
          setCheqData((prev) => ({ ...prev, session_id }));
        } catch (error) {
          showErrorNotification('خطا در دریافت شماره جلسه.');
          console.error('Error fetching session ID:', error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, sessionId: false }));
        }
      };

      if (!cheqData.session_id && !meetingId) {
        fetchSessionId();
      } else if (meetingId) {
        setCheqData((prev) => ({ ...prev, session_id: meetingId }));
        localStorage.setItem('session_id', meetingId);
      }
    }, [cheqData.session_id, meetingId]);

    // دریافت شماره سریال بعدی در حالت غیر ویرایش
    useEffect(() => {
      if (!editMode && !cheqData.serialNo) {
        const fetchNextSerial = async () => {
          setSerialNoStatus('loading');
          setLoadingStates((prev) => ({ ...prev, serialNo: true }));
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = user?.roles[0] === 'admin';
            const url = isAdmin
              ? `${endpoints.cheques}/next-serial?school_id=${user.school_id || '1'}`
              : `${endpoints.cheques}/next-serial`;
            const response = await api.get(url);
            const serialNo = String(response.data.data.next_serial);
            setCheqData((prev) => ({ ...prev, serialNo }));
            setServerSerialNo(serialNo);
            setSerialNoStatus('success');
          } catch (error) {
            setSerialNoStatus('error');
          
            // تلاش برای گرفتن پیام مناسب
            let message = 'خطا در دریافت شماره سریال چک.'; // متن دیفالت
            if (error.response?.data?.message) {
              message = error.response.data.message; // پیام بک‌اند
            } else if (error.message) {
              message = error.message; // پیام خطای جاوااسکریپت (مثلاً شبکه)
            }
          
            showErrorNotification(message);
            console.error('Error fetching next serial:', error);
          }
          finally {
            setLoadingStates((prev) => ({ ...prev, serialNo: false }));
          }
        };
        fetchNextSerial();
      }
    }, [editMode, cheqData.serialNo]);

    // مدیریت انتخاب تاریخ
    const handleDateSelect = useCallback((date) => {
      const formattedDate = date.format('jYYYYjMMjDD');
      setCheqData((prev) => ({ ...prev, issueDate: formattedDate }));
      setIsIssueDatePickerOpen(false);
    }, []);

    // مدیریت تغییرات ورودی‌ها
    const handleInputChange = useCallback((e) => {
      const { name, value } = e.target;
      const englishValue =
        name === 'serialNo' || name === 'amount' || name === 'recieverName'
          ? toEnglishDigits(value)
          : value;
      setCheqData((prev) => ({ ...prev, [name]: englishValue }));
    }, []);

    // صدور یا ویرایش چک
    const handleIssueCheque = useCallback(async () => {
      if (loadingStates.chequeData) return; // جلوگیری از اجرای دوباره در حین لودینگ
    
      if (!selectedRole) {
        showErrorNotification('لطفاً نقش گیرنده یا فروشنده را انتخاب کنید.');
        return;
      }
      if (!cheqData.cheque_book_id) {
        showErrorNotification('دفترچه چک انتخاب نشده است.');
        return;
      }
      if (!cheqData.bank_account_id) {
        showErrorNotification(' حساب بانکی انتخاب نشده است.');
        return;
      }
      if (!isCheqDataFilled(cheqData, selectedRole)) {
        showErrorNotification(
          selectedRole === 'buyer'
            ? 'لطفاً تمام فیلدهای اجباری (سریال چک، مبلغ، تاریخ صدور، نام گیرنده) را پر کنید.'
            : 'لطفاً تمام فیلدهای اجباری (سریال چک، مبلغ، تاریخ صدور، اطلاعات فروشنده) را پر کنید.'
        );
        return;
      }
    
      setLoadingStates((prev) => ({ ...prev, chequeData: true }));
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const schoolId = userData.school_id || '';
        if (!schoolId) {
          throw new Error('شناسه مدرسه یافت نشد.');
        }
        const payload = { ...cheqData, school_id: schoolId, role: selectedRole };
        let response;
        if (editMode) {
          response = await api.put(`${endpoints.cheques}/${cheqData.id}`, payload);
          showSuccessNotification('چک با موفقیت ویرایش شد.');
        } else {
          response = await api.post(endpoints.cheques, payload);
          showSuccessNotification('چک با موفقیت صادر شد.');
        }
        onSubmit(response.data.data);
        setQuestionType(editMode ? null : 'postIssue');
      } catch (error) {
        const errorMessage =
          error.response?.data?.errors?.serialNo || error.response?.data?.message || 'خطا در صدور/ویرایش چک. لطفاً دوباره تلاش کنید.';
        showErrorNotification(errorMessage);
        console.error('Error issuing cheque:', error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, chequeData: false }));
      }
    }, [cheqData, selectedRole, editMode, onSubmit, isCheqDataFilled]);

    // مدیریت تأیید صدور چک دیگر
    const handleConfirmAnotherCheque = useCallback(() => {
      setCheqData({
        cheque_book_id: localStorage.getItem('activeChequebookId') || '',
        serialNo: '',
        amount: '',
        issueDate: '',
        recieverName: '',
        recieverBankNo: '',
        recieverBankName: '',
        recieverBankBranch: '',
        session_id: meetingId || localStorage.getItem('session_id') || '',
        bank_account_id: bankAccounts[0]?.id || '',
        id: '',
      });
      setSelectedRole('');
      setSerialNoStatus('initial');
      setServerSerialNo('');
      setUseDocRowsAmount(false); // ریست کردن حالت استفاده از مبلغ سند
      localStorage.removeItem('cheqData');
      setQuestionType(null);
    }, [meetingId, bankAccounts]);

    // مدیریت لغو صدور چک دیگر
    const handleCancelAnotherCheque = useCallback(() => {
      if (fromPage === 'meetingpart4' && location.pathname === "/Meetings/Document/4") {
        setQuestionType(null);
        localStorage.removeItem('meetingDocumentFormData');
        navigate('/Meetings');
      } else if (fromPage === 'meetingpart4' && location.pathname === "/Accounting/Document/7") {
        setQuestionType(null);
        localStorage.removeItem('meetingDocumentFormData');
        navigate('/Accounting/Document/7');
        setShowCheq(false);
        onClose();
      } else {
        setQuestionType(null);
        localStorage.removeItem('cheqData');
        localStorage.removeItem('cheque_id');
        setShowCheq(false);
      }
    }, [fromPage, location.pathname, navigate, setShowCheq, onClose]);

    // مدیریت تأیید بستن مدال
    const handleConfirmClose = useCallback(() => {
      setQuestionType(null);
      localStorage.removeItem('cheqData');
      localStorage.removeItem('cheque_id');
      setShowCheq(false);
    }, [setShowCheq]);

    // مدیریت لغو بستن مدال
    const handleCancelClose = useCallback(() => {
      setQuestionType(null);
    }, []);

    // مدیریت تأیید استفاده از مبلغ سند
    const handleConfirmUseDocRowsAmount = useCallback(() => {
      setUseDocRowsAmount(true);
      setQuestionType(null);
    }, []);

    // مدیریت لغو استفاده از مبلغ سند
    const handleCancelUseDocRowsAmount = useCallback(() => {
      setUseDocRowsAmount(false);
      setQuestionType(null);
    }, []);

    // رندر جعبه سؤال بر اساس نوع
    const renderQuestionBox = () => {
      switch (questionType) {
        case 'postIssue':
          // return (
          //   <QuestionBox
          //     message="آیا می‌خواهید روی این جلسه چک دیگری ثبت کنید؟"
          //     onConfirm={handleConfirmAnotherCheque}
          //     onCancel={handleCancelAnotherCheque}
          //   />
          // );
        case 'close':
          return (
            <QuestionBox
              message="آیا می‌خواهید از این بخش خارج شوید؟"
              onConfirm={handleConfirmClose}
              onCancel={handleCancelClose}
            />
          );
        case 'askUseDocRowsAmount':
          // return (
          //   <QuestionBox
          //     message="شما یک سند نیمه کاره دارید|آیا می‌خواهید برای آن چک ثبت کنید؟"
          //     onConfirm={handleConfirmUseDocRowsAmount}
          //     onCancel={handleCancelUseDocRowsAmount}
          //   />
          // );
        default:
          return null;
      }
    };

    const getSerialNoPlaceholder = () => {
      if (serialNoStatus === 'loading') return 'در حال دریافت...';
      if (serialNoStatus === 'error') return 'خطایی رخ داده است';
      return toPersianDigits(serverSerialNo || toPersianDigits(cheqData.serialNo) || 'سریال چک');
    };

    const isFormValid = selectedRole && isCheqDataFilled(cheqData, selectedRole);
    const isAnyLoading = Object.values(loadingStates).some((state) => state);

    // محاسبه مجموع مبلغ ردیف‌های سند
    const getDocRowsTotalAmount = () => {
      try {
        const data = localStorage.getItem("accountingDocumentFormData");
        if (!data) return 0;

        const parsed = JSON.parse(data);

        if (!parsed.docRows) return 0;

        return parsed.docRows.reduce((total, row) => {
          if (row.DocRowDetails && Array.isArray(row.DocRowDetails)) {
            return (
              total +
              row.DocRowDetails.reduce(
                (rowTotal, detail) => rowTotal + (Number(detail.amount) || 0),
                0
              )
            );
          }
          return total;
        }, 0);
      } catch (err) {
        console.error("خطا در محاسبه مجموع amounts:", err);
        return 0;
      }
    };

    return (
      <div className={style.modalOverlay}>
        <div className={style.modalContent}>
          <h1>{editMode ? 'ویرایش چک' : 'صدور چک'}</h1>
          <div className={style.Cheq}>
            <div className={style.lineone}>
              <div className={style.makedate}>
                <p>تاریخ صدور:</p>
                <input
                  type="text"
                  name="issueDate"
                  value={formatDateForDisplay(cheqData.issueDate)}
                  onChange={handleInputChange}
                  placeholder="روز/ماه/سال"
                  readOnly
                  className={style.input}
                />
                <img
                  src={calenderIcon}
                  onClick={() => setIsIssueDatePickerOpen((prev) => !prev)}
                  alt="تقویم"
                  className={style.calendarIcon}
                />
              </div>
              <div className={style.cheqprice}>
                <p>مبلغ:</p>
                <input
                  type="text"
                  name="amount"
                  value={cheqData.amount ? toPersianDigits(cheqData.amount) : (useDocRowsAmount ? toPersianDigits(getDocRowsTotalAmount()) : '')}
                  onChange={handleInputChange}
                  placeholder={toPersianDigits(getDocRowsTotalAmount()) || "مبلغ چک"}
                  className={style.input}
                />
              </div>
            </div>
            <ShamsiDatePicker
              isOpen={isIssueDatePickerOpen}
              onClose={() => setIsIssueDatePickerOpen(false)}
              onSelectDate={handleDateSelect}
              selectedDate={cheqData.issueDate ? moment(cheqData.issueDate, 'jYYYYjMMjDD') : moment()}
            />
            <div className={style.linetwo}>
              <div className={style.cardnumber}>
                <p>شماره حساب:</p>
                <input
                  type="text"
                  value={toPersianDigits(bankAccounts[0]?.accountNumber || '1234567890')}
                  placeholder="شماره حساب"
                  readOnly
                  className={style.input}
                />
              </div>
              <div className={style.cheqserial}>
                <p>سریال چک:</p>
                <input
                  type="text"
                  name="serialNo"
                  value={toPersianDigits(cheqData.serialNo)}
                  onChange={handleInputChange}
                  placeholder={getSerialNoPlaceholder()}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.linethree}>
              <div className={style.buyer}>
                <div className={style.buyerselect}>
                  <input
                    type="radio"
                    id="buyer"
                    className={style.customradio}
                    name="role"
                    value="buyer"
                    checked={selectedRole === 'buyer'}
                    onChange={() => setSelectedRole('buyer')}
                  />
                  <label htmlFor="buyer">گیرنده</label>
                </div>
                <div
                  className={style.buyername}
                  style={{
                    pointerEvents: selectedRole === 'buyer' ? 'auto' : 'none',
                    opacity: selectedRole === 'buyer' ? 1 : 0.5,
                  }}
                >
                  <input
                    type="text"
                    name="recieverName"
                    value={cheqData.recieverName}
                    onChange={handleInputChange}
                    placeholder="نام گیرنده"
                    className={style.input}
                  />
                </div>
              </div>
              <div className={style.seller}>
                <div className={style.sellerselect}>
                  <input
                    type="radio"
                    id="seller"
                    className={style.customradio}
                    name="role"
                    value="seller"
                    checked={selectedRole === 'seller'}
                    onChange={() => setSelectedRole('seller')}
                  />
                  <label htmlFor="seller">فروشنده</label>
                </div>
                <div
                  className={style.sellerinfo}
                  style={{
                    pointerEvents: selectedRole === 'seller' ? 'auto' : 'none',
                    opacity: selectedRole === 'seller' ? 1 : 0.5,
                  }}
                >
                  <input
                    type="text"
                    name="recieverBankNo"
                    value={toPersianDigits(cheqData.recieverBankNo)}
                    onChange={handleInputChange}
                    placeholder="شماره حساب"
                    className={style.input}
                  />
                  <input
                    type="text"
                    name="recieverName"
                    value={cheqData.recieverName}
                    onChange={handleInputChange}
                    placeholder="به نام"
                    className={style.input}
                  />
                  <input
                    type="text"
                    name="recieverBankName"
                    value={cheqData.recieverBankName}
                    onChange={handleInputChange}
                    placeholder="نام بانک"
                    className={style.input}
                  />
                  <input
                    type="text"
                    name="recieverBankBranch"
                    value={cheqData.recieverBankBranch}
                    onChange={handleInputChange}
                    placeholder="نام یا کد شعبه"
                    className={style.input}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={style.buttons}>
            <button className={style.nextButton} onClick={handleCancelAnotherCheque}>
              بستن
            </button>
            <button
              className={style.nextButton}
              onClick={handleIssueCheque}
              // disabled={isAnyLoading || !isFormValid}
            >
              {isAnyLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {editMode ? 'ویرایش چک' : 'صدور چک'}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
          {renderQuestionBox()}
        </div>
      </div>
    );
  }

  Cheq.propTypes = {
    setShowCheq: PropTypes.func.isRequired,
    editMode: PropTypes.bool,
    initialData: PropTypes.object,
    meetingId: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    isModal: PropTypes.bool,
    fromPage: PropTypes.string,
    onClose: PropTypes.func,
  };

  Cheq.defaultProps = {
    editMode: false,
    initialData: {},
    meetingId: '',
    isModal: true,
    fromPage: '',
    onClose: () => {},
  };

  export default Cheq;