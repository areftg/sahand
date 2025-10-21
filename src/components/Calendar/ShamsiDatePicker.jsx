// ShamsiDatePicker.jsx

import React, { useState, useEffect } from 'react';
import moment from 'jalali-moment';
import styles from './ShamsiDatePicker.module.css';
import drop from "../../assets/icons/dropGreen.svg"

const ShamsiDatePicker = ({ isOpen, onClose, onSelectDate, stylee = {} }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  // --- اضافه شده: state برای مدیریت حالت نمایش (روزها، ماه‌ها یا سال‌ها) ---
  const [viewMode, setViewMode] = useState('days'); // 'days', 'years'

  const jalaaliMonths = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
  ];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'jMonth'));
  };

  const goToPrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'jMonth'));
  };

  // --- اضافه شده: توابع برای جابجایی بین بازه‌های سال ---
  const goToNextYearRange = () => {
    setCurrentMonth(currentMonth.clone().add(12, 'jYear'));
  };

  const goToPrevYearRange = () => {
    setCurrentMonth(currentMonth.clone().subtract(12, 'jYear'));
  };


  const handleDateClick = (day) => {
    onSelectDate(day);
    onClose();
  };
  
  // --- اضافه شده: تابع برای انتخاب سال ---
  const handleYearSelect = (year) => {
    const newDate = currentMonth.clone().jYear(year);
    setCurrentMonth(newDate);
    setViewMode('days'); // بعد از انتخاب سال، به نمایش روزها برمی‌گردیم
  };

  const renderCalendarDays = () => {
    const days = [];
    const monthStart = currentMonth.clone().startOf('jMonth');
    const monthEnd = currentMonth.clone().endOf('jMonth');
    // --- یک اصلاح کوچک: شروع هفته باید بر اساس locale فارسی (شنبه) باشد ---
    const startDate = monthStart.clone().startOf('week'); 
    // jalali-moment به صورت پیش‌فرض شنبه را اول هفته می‌داند پس کد شما درست کار می‌کند

    let day = startDate.clone();

    // برای جلوگیری از حلقه بی‌نهایت در برخی موارد خاص، یک شرط اضافه می‌کنیم
    for(let w = 0; w < 6; w++) {
        let weekRow = [];
        for (let i = 0; i < 7; i++) {
            const isCurrentMonth = day.isSame(currentMonth, 'jMonth');
            const isFriday = day.day() === 5; // در moment فارسی جمعه ایندکس 5 را دارد
            const dayClone = day.clone();

            const classNames = [
              isCurrentMonth ? styles.day : styles.disabled,
              isFriday ? styles.friday : ''
            ].join(' ');

            weekRow.push(
              <td
                key={day.format('jYYYY/jMM/jDD')}
                className={classNames}
                onClick={() => isCurrentMonth && handleDateClick(dayClone)}
              >
                {day.format('jD')}
              </td>
            );
            day.add(1, 'day');
        }
        days.push(<tr key={`week-${w}`}>{weekRow}</tr>);
        if (day.isAfter(monthEnd) && !day.isSame(monthEnd,'week')) break;
    }
    return days;
  };
  
  // --- اضافه شده: تابع برای رندر کردن لیست سال‌ها ---
  const renderYearSelector = () => {
    const currentYear = currentMonth.jYear();
    // نمایش ۱۲ سال در یک صفحه
    const startYear = Math.floor((currentYear - 6) / 10) * 10;
    const years = [];
    let yearRow = [];

    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      const isCurrentYear = year === currentYear;

      yearRow.push(
        <td
          key={year}
          className={`${styles.yearCell} ${isCurrentYear ? styles.currentYear : ''}`}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </td>
      );

      if ((i + 1) % 5 === 0) {
        years.push(<tr key={`year-row-${i}`}>{yearRow}</tr>);
        yearRow = [];
      }
    }
    return years;
  };

  // --- اضافه شده: تابع برای نمایش هدر بر اساس حالت نمایش ---
  const renderHeader = () => {
    if (viewMode === 'years') {
      const startYear = Math.floor((currentMonth.jYear() - 6) / 10) * 10;
      const endYear = startYear + 11;
      // ${startYear} - ${endYear}
      return `انتخاب سال`;
    }
    return `${jalaaliMonths[currentMonth.jMonth()]} ${currentMonth.format('jYYYY')}`;
  };


  return (
    <div className={`${styles.popupOverlay} ${stylee.date}`} onClick={onClose}>
      <div className={`${styles.popupContent} ${stylee.datecontent}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarHeadermanage}>
            {/* --- ویرایش شده: عملکرد دکمه‌ها بر اساس حالت نمایش تغییر می‌کند --- */}
            <button onClick={viewMode === 'days' ? goToPrevMonth : goToPrevYearRange}><img src={drop} style={{rotate:"-90deg"}} alt=''/></button>
            <button onClick={viewMode === 'days' ? goToNextMonth : goToNextYearRange}><img src={drop} style={{rotate:"90deg"}} alt=''/></button>
          </div>
          {/* --- ویرایش شده: هدر قابل کلیک است و محتوای آن داینامیک است --- */}
          <div className={styles.monthYearHeader} onClick={() => setViewMode('years')}>
           <img src={drop} style={{rotate:"-90deg"}} alt=''/>   {renderHeader()}
          </div>
        </div>

        {/* --- ویرایش شده: نمایش محتوا بر اساس حالت نمایش --- */}
        {viewMode === 'days' ? (
          <table className={styles.calendarGrid}>
            <thead>
              <tr className={styles.calendarHeaderr}>
                <th>ش</th>
                <th>ی</th>
                <th>د</th>
                <th>س</th>
                <th>چ</th>
                <th>پ</th>
                <th>ج</th>
              </tr>
            </thead>
            <tbody>
              {renderCalendarDays()}
            </tbody>
          </table>
        ) : (
          <table className={styles.yearGrid}>
            <tbody>
              {renderYearSelector()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShamsiDatePicker;