import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import style from './MeetingFrame.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { showSuccessNotification, showErrorNotification } from '../../services/notificationService';
import api, { endpoints } from '../../config/api.js';

const FormmeetingDataContext = createContext(null);

export const useFormData = () => useContext(FormmeetingDataContext);

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({});
  const updateFormData = (newData) =>
    setFormData((prev) => ({ ...prev, ...newData }));

  return (
    <FormmeetingDataContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormmeetingDataContext.Provider>
  );
};

const LOCAL_STORAGE_KEY = 'meetingDocumentFormData';

export default function MeetingFrame({
  children,
  isModal = false,
  onClose,
  onSubmit,
  currentStep,
  setCurrentStep,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
      console.error('Failed to parse stored form data from localStorage:', error);
      return {};
    }
  });

  const stepPaths = [
    '/Meetings/Document',
    '/Meetings/Document/2',
    '/Meetings/Document/3',
    '/Meetings/Document/4',
  ];
  const totalSteps = stepPaths.length;
  const currentStepNumber = isModal ? currentStep : stepPaths.indexOf(location.pathname) + 1;

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
        console.log('Form data saved to localStorage:', formData);
      } catch (error) {
        console.error('Failed to save form data to localStorage:', error);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [formData]);

  const gotohome = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/Meetings');
    }
  };

  const goToPreviousStep = () => {
    if (currentStepNumber > 1) {
      if (isModal) {
        setCurrentStep((prev) => prev - 1);
      } else {
        navigate(stepPaths[currentStepNumber - 2]);
      }
    }
  };

  const updateFormData = (newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  };

  const goToNextStep = async () => {
    if (currentStepNumber < totalSteps) {
      if (isModal) {
        setCurrentStep((prev) => prev + 1);
      } else {
        navigate(stepPaths[currentStepNumber]);
      }
    } else {
      try {
        await api.post(endpoints.meets, formData);
        showSuccessNotification('جلسه با موفقیت ثبت شد.');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        if (isModal && onSubmit) {
          onSubmit(formData);
        } else {
          navigate('/Meetings');
        }
      } catch (error) {
        console.error('خطا در ثبت جلسه:', error);
        showErrorNotification('خطا در ثبت جلسه.');
      }
    }
  };

  return (
    <FormmeetingDataContext.Provider
      value={{ formData, updateFormData, goToNextStep, isModal, onClose }}
    >
      <div className={style.main}>
        <div className={style.conbutton}>
          {currentStepNumber > 1 && (
            <button className={style.button} onClick={goToPreviousStep}>
              <img src={Arrow} alt='' style={{ rotate: '180deg', height: '30px' }} />
              مرحله قبلی
            </button>
          )}
          <button className={style.button} onClick={gotohome}>
            <img src={Arrow} alt='' style={{ rotate: '180deg', height: '30px' }} />
            بازگشت به صفحه اصلی
          </button>
        </div>
        <div className={style.content}>
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
    </FormmeetingDataContext.Provider>
  );
}