import React, { useState, useEffect, useRef, useCallback } from 'react';

function TimeInput({ defaultValue = '00:00', onTimeChange }) {
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  const debounceTimeout = useRef(null);
  const lastSentTime = useRef(defaultValue);

  // ❗ تعریف توابع کمکی در ابتدای کامپوننت و با استفاده از useCallback
  const formatTwoDigits = useCallback((val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? '00' : num.toString().padStart(2, '0');
  }, []);

  const removeLeadingZero = useCallback((val) => {
    return String(parseInt(val, 10) || 0);
  }, []);

  // useEffect برای مقداردهی اولیه
  useEffect(() => {
    const [h = '00', m = '00'] = defaultValue.split(':');
    const formattedH = formatTwoDigits(h);
    const formattedM = formatTwoDigits(m);
    setHour(formattedH);
    setMinute(formattedM);
    lastSentTime.current = `${formattedH}:${formattedM}`;
  }, [defaultValue, formatTwoDigits]);


  // useEffect اصلی برای ارسال اطلاعات با تأخیر
  useEffect(() => {
    clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const currentTime = `${formatTwoDigits(hour)}:${formatTwoDigits(minute)}`;
      
      if (onTimeChange && currentTime !== lastSentTime.current) {
        onTimeChange(currentTime);
        lastSentTime.current = currentTime;
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [hour, minute, onTimeChange, formatTwoDigits]); // ✅ حالا formatTwoDigits قبل از این هوک تعریف شده است


  const handleChange = useCallback((val, type) => {
    const cleanVal = val.replace(/[^\d]/g, '').slice(0, 2);
    let num = parseInt(cleanVal, 10);
    if (isNaN(num)) num = 0;

    if (type === 'hour') {
      if (num > 23) num = 23;
      setHour(String(num));
    } else {
      if (num > 59) num = 59;
      setMinute(String(num));
    }
  }, []);

  const handleFocus = useCallback((e) => {
    e.target.select();
    const type = e.target.name;
    if (type === 'hour') {
      setHour(removeLeadingZero);
    } else {
      setMinute(removeLeadingZero);
    }
  }, [removeLeadingZero]);

  const handleBlur = useCallback((e) => {
    const type = e.target.name;
    if (type === 'hour') {
      setHour(formatTwoDigits);
    } else {
      setMinute(formatTwoDigits);
    }
  }, [formatTwoDigits]);


  return (
    <div style={containerStyle}>
      <input
        type="text"
        inputMode="numeric"
        dir="rtl"
        name="hour"
        value={hour}
        onChange={(e) => handleChange(e.target.value, 'hour')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        placeholder="ساعت"
      />
      <span style={colonStyle}>:</span>
      <input
        type="text"
        inputMode="numeric"
        dir="rtl"
        name="minute"
        value={minute}
        onChange={(e) => handleChange(e.target.value, 'minute')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        placeholder="دقیقه"
      />
    </div>
  );
}

// استایل‌ها (بدون تغییر)
const containerStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  fontFamily: 'bold',
  fontSize: '16px',
  direction: 'rtl',
  backgroundColor: '#f0f0f0',
  borderRadius: '9px',
  padding: '6px',
  gap: '6px',
  width: 'fit-content',
  height: '35px',
  margin: '10px 0'
};

const inputStyle = {
  width: '30px',
  textAlign: 'center',
  fontFamily: 'bold',
  fontSize: '15px',
  fontWeight: 'bold',
  padding: '3px',
  border: '0',
  outline: 'none',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  height: '25px'
};

const colonStyle = {
  fontSize: '20px',
  margin: '0 4px',
  fontFamily: 'bold'
};

export default TimeInput;