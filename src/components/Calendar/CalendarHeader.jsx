import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-jalaali';
import CalendarPopup from './CalendarPopup';
import styles from './CalendarHeader.module.css';


moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

export default function CalendarHeader() {
  const [today, setToday] = useState({ date: '', weekday: '' });
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const now = moment();
    setToday({
      date: now.format('jYYYY/jMM/jDD'),
      weekday: now.format('dddd')
    });

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={ref}>
      <div
        // onClick={() => setShowPopup(prev => !prev)}
       className={styles.headerBox}
      >
        <span>{today.weekday}</span>
        <span>•</span>
        <span>{today.date}</span>
      </div>

      {showPopup && (
        <div className={styles.popup}>
          <CalendarPopup />
        </div>
      )}
    </div>
  );
}
