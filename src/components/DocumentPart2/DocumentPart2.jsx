import style from './DocumentPart2.module.css';
import Arrow from '../../assets/icons/arrow.svg';
import { useFormData } from '../DocumentFrame/DocumentFrame';
import { showWarningNotification } from '../../services/notificationService';
import React, { useState, useEffect } from 'react';
import QuestionBox from '../../components/QuestionBox/QuestionBox';

export default function DocumentPart2() {
  const { formData, updateFormData, goToNextStep } = useFormData();
  const [selectedOption, setSelectedOption] = useState(formData.DocType || null);
  const [subOption, setSubOption] = useState(formData.SubDocType || '');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOption, setPendingOption] = useState(null);

  const options = [
    { id: 'SaveRecievesDoc', title: 'دریافتی', tooltip: 'سند مربوط به دریافت وجه' },
    { id: 'savePaymentDoc', title: 'هزینه پرداختی', tooltip: 'سند مربوط به پرداخت هزینه' },
  ];

  const subOptions = [
    { id: 'GetMonyForTankhahDoc', title: 'افزایش اعتبار تنخواه گردان از محل حساب' },
    { id: 'ReturnTankhahRemainDoc', title: 'بازگردانی اعتبار تنخواه گردان به حساب' },
  ];

  // تنظیم selectedOption بر اساس SubDocType از localStorage
  useEffect(() => {
    if (subOptions.some(option => option.id === formData.SubDocType)) {
      setSelectedOption('GetMonyForTankhahDoc');
      setSubOption(formData.SubDocType || '');
      console.log('DocumentPart2: selectedOption تنظیم شد به GetMonyForTankhahDoc به دلیل SubDocType:', formData.SubDocType);
    }
  }, [formData.SubDocType]);

  const handleSelect = (option) => {
    if (option.id !== selectedOption && formData.docRows && formData.docRows.length > 0) {
      setPendingOption(option);
      setShowConfirmDialog(true);
    } else {
      setSelectedOption(option.id);
      setSubOption('');
      updateFormData({
        DocType: option.id,

      });
      console.log('DocumentPart2: DocType تغییر کرد به:', option.id);
    }
  };

  const handleSubOptionSelect = (e) => {
    const newSubOption = e.target.value;
    setSubOption(newSubOption);
    setSelectedOption('GetMonyForTankhahDoc');
    updateFormData({
      DocType: newSubOption,
    });
    console.log('DocumentPart2: SubDocType تغییر کرد به:', newSubOption);
  };

  const handleConfirm = (confirmed) => {
    if (confirmed) {
      setSelectedOption(pendingOption.id);
      setSubOption('');
      updateFormData({
        DocType: pendingOption.id,
        docRows: [],
      });
      console.log('DocumentPart2: DocType تغییر کرد به:', pendingOption.id, 'و docRows پاک شد');
    } else {
      console.log('DocumentPart2: تغییر DocType لغو شد');
    }
    setShowConfirmDialog(false);
    setPendingOption(null);
  };

  const handleNextClick = () => {
    if (!selectedOption) {
      showWarningNotification('لطفاً حداقل یک گزینه را انتخاب کنید');
      return;
    }
    if (selectedOption === 'GetMonyForTankhahDoc' && !subOption) {
      showWarningNotification('لطفاً یک گزینه از منوی کشویی انتخاب کنید');
      return;
    }
    goToNextStep();
  };

  return (
    <div className={style.DocumentPart2}>
      <h1>نوع سند خود را انتخاب کنید</h1>
      <div className={style.list}>
        {options.map((option) => (
          <div key={option.id} className={style.optionWrapper}>
            <div
              className={style.option}
              onClick={() => handleSelect(option)}
            >
              <div className={style.circle}>
                {selectedOption === option.id && <div className={style.dot}></div>}
              </div>
              <div className={style.title} title={option.tooltip}>
                {option.title}
              </div>
            </div>
          </div>
        ))}

        {/* سلکت‌باکس مخصوص تنخواه */}
        <div className={style.optionWrapper}>
          <div className={style.option}>
            <div className={style.circle}>
              {selectedOption === 'GetMonyForTankhahDoc' && <div className={style.dot}></div>}
            </div>
            <div className={style.title}>
              <select
                className={style.dropdown}
                value={subOption}
                onChange={handleSubOptionSelect}
              >
                <option value="" disabled>یک گزینه انتخاب کنید</option>
                {subOptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button className={style.nextButton} onClick={handleNextClick}>
        مرحله بعدی <img src={Arrow} alt='' style={{ height: "20px" }} />
      </button>

      {showConfirmDialog && (
        <QuestionBox
          message="با تغییر نوع سند، فاکتورهای موجود در این سند پاک می‌شوند. آیا مطمئن هستید؟"
          onConfirm={() => handleConfirm(true)}
          onCancel={() => handleConfirm(false)}
        />
      )}
    </div>
  );
}