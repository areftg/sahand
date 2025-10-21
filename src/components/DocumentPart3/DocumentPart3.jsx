import style from './DocumentPart3.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import React, { useState, useEffect } from 'react';
import api, { endpoints } from '../../config/api.js';
import ShamsiDatePicker from '../Calendar/ShamsiDatePicker';
import calenderIcon from '../../assets/icons/Calender.svg';
import moment from 'moment-jalaali';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx';
import { showWarningNotification } from '../../services/notificationService.jsx';
import { useNavigate } from 'react-router-dom';

export default function DocumentPart3() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');
  const [docId, setDocId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Flag to check if in edit mode

  // Check if in edit mode by checking localStorage
  useEffect(() => {
    const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData'));
    if (formData.id) {
      setIsEditing(true); // If formData exists, we're in edit mode
    }
  }, []);

  // Handle date selection
  const handleDateSelect = (date) => {
    const formattedDate = date.format('jYYYYjMMjDD');
    updateFormData({ IssueDate: formattedDate });
  };

  // Fetch documents
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const schoolId = user?.school_id;
    let isActive = true;
    setLoading(true);

    const fetchDocs = async () => {
      try {
        const response = await api.get(
          `${endpoints.docs}/Latest-DocNo?school_id=${schoolId}`
        );
        const responseData = response.data.data;
        setDocId(responseData.next_available_doc_no);

        if (isActive) {
          setDocs((prevDocs) => {
            return page === 1 ? responseData.data : [...prevDocs, ...responseData.data];
          });
        }
      } catch (error) {
        console.error('خطا در دریافت شماره سند:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDocs();

    return () => {
      isActive = false;
    };
  }, [page, sortBy]);

  // Handle button click based on mode
// ... سایر کدها بدون تغییر ...
// ... سایر کدها بدون تغییر ...
const handleButtonClick = () => {
  if (!formData.IssueDate) {
    showWarningNotification('لطفاً تاریخ را انتخاب کنید');
    return;
  }

  if (isEditing) {
    // ذخیره flag برای باز کردن مودال
    localStorage.setItem('openEditModal', 'true');
    // نگذارید localStorage پاک شود
    navigate('/Accounting');
  } else {
    goToNextStep();
  }
};
// ... سایر کدها بدون تغییر ...
// ... سایر کدها بدون تغییر ...

  return (
    <div className={style.DocumentPart3}>
      <h1>تاریخ سند خود را وارد کنید</h1>
      <div className={style.list}>
        <div className={style.firstoption}>
          <div className={style.option}>
            <p>تاریخ:</p>
            <div
              className={style.title}
              onClick={() => setIsPickerOpen(true)}
            >
              {formData.IssueDate
                ? moment(formData.IssueDate, 'jYYYYjMMjDD').format('jYYYY/jMM/jDD')
                : 'تاریخ را انتخاب کنید'}
            </div>
          </div>
          <div className={style.calender}>
            <img
              src={calenderIcon}
              onClick={() => setIsPickerOpen((prev) => !prev)}
              alt=''
            />
          </div>
        </div>

        <div className={style.option}>
          <p>شماره:</p>
          <input
            disabled
            value={
              isEditing
                ? JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}')?.DocNo || ''
                : (docId !== null ? docId : '')
            }
            type="text"
            className={style.title}
            placeholder={loading ? 'درحال بارگذاری...' : 'خطا در برقراری ارتباط...'}
          />

        </div>
      </div>

      <ShamsiDatePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectDate={handleDateSelect}
      />

      <button className={style.nextButton} onClick={handleButtonClick}>
        {isEditing ? 'تایید' : (
          <>
            مرحله بعدی <img src={Arrow} alt='' style={{ height: '20px' }} />
          </>
        )}
      </button>
    </div>
  );
}