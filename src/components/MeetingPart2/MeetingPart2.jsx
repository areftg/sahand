import style from './MeetingPart2.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../MeetingFrame/MeetingFrame';
import React, { useState, useEffect, useRef } from 'react';
import ShamsiDatePicker from '../Calendar/ShamsiDatePicker';
import CustomTimePicker from '../Calendar/CustomTimePicker';
import calenderIcon from '../../assets/icons/Calender.svg';
import moment from 'jalali-moment';
import api, { endpoints } from '../../config/api';
import { showErrorNotification, showSuccessNotification, showWarningNotification } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export default function MeetingPart2() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const navigate = useNavigate();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionDate, setSessionDate] = useState(formData.sessionDate || '');
  const [sessionDay, setSessionDay] = useState(formData.sessionDay || '');
  const [startTime, setStartTime] = useState(formData.startTime || '');
  const [endTime, setEndTime] = useState(formData.endTime || '');
  const isInitialMount = useRef(true); // برای کنترل اجرای اولیه

  // به‌روزرسانی localStorage با مقادیر جدید فرم
  const updateLocalStorage = (newData) => {
    const currentFormData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
    const updatedFormData = {
      ...currentFormData,
      ...newData,
      sessionNumber: formData.session_id || currentFormData.sessionNumber || localStorage.getItem('session_id'),
      id: currentFormData.id || formData.session_id || localStorage.getItem('session_id'),
      isEditing,
    };
    localStorage.setItem('meetingDocumentFormData', JSON.stringify(updatedFormData));
  };

  // لود داده‌ها در حالت ویرایش یا دریافت session_id در حالت غیر ویرایش
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // فقط در رندر اولیه اجرا شود
      const meetingFormData = JSON.parse(localStorage.getItem('meetingDocumentFormData') || '{}');
      if (meetingFormData.sessionNumber && meetingFormData.edit) {
        setIsEditing(true);
        setSessionDate(meetingFormData.sessionDate || '');
        setSessionDay(meetingFormData.sessionDay || '');
        setStartTime(meetingFormData.startTime || '');
        setEndTime(meetingFormData.endTime || '');
        updateFormData({
          sessionDate: meetingFormData.sessionDate || '',
          sessionDay: meetingFormData.sessionDay || '',
          startTime: meetingFormData.startTime || '',
          endTime: meetingFormData.endTime || '',
          session_id: meetingFormData.sessionNumber,
        });
        updateLocalStorage({
          sessionDate: meetingFormData.sessionDate || '',
          sessionDay: meetingFormData.sessionDay || '',
          startTime: meetingFormData.startTime || '',
          endTime: meetingFormData.endTime || '',
          sessionNumber: meetingFormData.sessionNumber,
        });
      } else if (!formData.session_id) {
        const fetchSessionId = async () => {
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isAdmin = user?.roles?.[0] === 'admin';
            const url = isAdmin
              ? `${endpoints.meets}/Latest-SessionNo?school_id=${user.school_id}`
              : `${endpoints.meets}/Latest-SessionNo`;
            const response = await api.get(url);
            const { next_available_session_no } = response.data.data;
            localStorage.setItem('session_id', next_available_session_no);
            updateFormData({ session_id: next_available_session_no });
            updateLocalStorage({ sessionNumber: next_available_session_no });
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'خطا در دریافت شماره جلسه';
            showErrorNotification(errorMessage);
          }
        };
        fetchSessionId();
      }
    }
  }, [updateFormData]);

  const handleDateSelect = (date) => {
    const storageDate = date.format('jYYYYjMMjDD');
    const newSessionDay = date.format('dddd');
    setSessionDate(storageDate);
    setSessionDay(newSessionDay);
    updateFormData({
      sessionDate: storageDate,
      sessionDay: newSessionDay,
    });
    updateLocalStorage({
      sessionDate: storageDate,
      sessionDay: newSessionDay,
    });
    setIsPickerOpen(false);
  };

  const handleTimeSelect = (name, time) => {
    if (name === 'startTime') {
      setStartTime(time);
      updateFormData({ startTime: time });
      updateLocalStorage({ startTime: time });
      setIsStartTimePickerOpen(false);
    } else if (name === 'endTime') {
      setEndTime(time);
      updateFormData({ endTime: time });
      updateLocalStorage({ endTime: time });
      setIsEndTimePickerOpen(false);
    }
  };

  const displayDate = sessionDate
    ? moment(sessionDate, 'jYYYYjMMjDD').format('jYYYY/jMM/jDD')
    : 'تاریخ را انتخاب کنید';

  const handleButtonClick = () => {
    if (!sessionDate || !startTime || !endTime) {
      showWarningNotification('لطفاً تاریخ، ساعت شروع و ساعت پایان را وارد کنید');
      return;
    }

    if (isEditing) {
      setIsLoading(true);
      updateLocalStorage({
        sessionDate,
        sessionDay,
        startTime,
        endTime,
      });
      localStorage.setItem('openEditModal', 'true');
      showSuccessNotification('تغیرات با موفقیت‌ ثبت شد');
      navigate('/Meetings');
      setIsLoading(false);
    } else {
      updateLocalStorage({
        sessionDate,
        sessionDay,
        startTime,
        endTime,
      });
      goToNextStep();
    }
  };

  return (
    <div className={style.DocumentPart3}>
      <h1>زمان برگزاری جلسات خود را وارد کنید</h1>
      <div className={style.container}>
        <div className={style.list}>
          <div className={style.firstoption}>
            <div className={style.option}>
              <p>تاریخ:</p>
              <div className={style.title}>
                {displayDate}
              </div>
            </div>
            <div className={style.calender}>
              <img
                src={calenderIcon}
                onClick={() => setIsPickerOpen((prev) => !prev)}
                alt="calendar"
              />
            </div>
          </div>
          <div className={style.option}>
            <p>شماره:</p>
            <input
              type="text"
              name="documentNumber"
              className={style.title}
              value={formData.sessionNumber || formData.session_id || localStorage.getItem('session_id') || 'خطا در انجام عملیات'}
              disabled
            />
          </div>
        </div>
        <div className={style.list}>
          <div className={style.optionn}>
            <p>شروع:</p>
            <div
              className={style.title}
              onClick={() => setIsStartTimePickerOpen((prev) => !prev)}
            >
              {startTime || 'ساعت شروع را انتخاب کنید'}
            </div>
            <CustomTimePicker
              isOpen={isStartTimePickerOpen}
              onClose={() => setIsStartTimePickerOpen(false)}
              onSelectTime={(time) => handleTimeSelect('startTime', time)}
              selectedTime={startTime}
            />
          </div>
          <div className={style.optionn}>
            <p>پایان:</p>
            <div
              className={style.title}
              onClick={() => setIsEndTimePickerOpen((prev) => !prev)}
            >
              {endTime || 'ساعت پایان را انتخاب کنید'}
            </div>
            <CustomTimePicker
              isOpen={isEndTimePickerOpen}
              onClose={() => setIsEndTimePickerOpen(false)}
              onSelectTime={(time) => handleTimeSelect('endTime', time)}
              selectedTime={endTime}
            />
          </div>
        </div>
        <ShamsiDatePicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelectDate={handleDateSelect}
          selectedDate={sessionDate ? moment(sessionDate, 'jYYYYjMMjDD') : null}
        />
      </div>
      <button className={style.nextButton} onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : isEditing ? (
          'تأیید'
        ) : (
          <>
            مرحله بعدی <img src={Arrow} alt="next" style={{ height: '20px' }} />
          </>
        )}
      </button>
    </div>
  );
}