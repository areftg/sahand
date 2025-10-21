import React, { useState, useRef, useEffect } from 'react';
import style from './IssueReportCard.module.css';
import Print from '../../assets/icons/print.svg'

export default function IssueReportCard() {
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
const [isMenuOpen, setIsMenuOpen] = useState(false);
const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);




  // اضافه کردن state برای گزینه انتخاب شده
  const [selectedRightIndex, setSelectedRightIndex] = useState(null);
  const [selectedLeftIndex, setSelectedLeftIndex] = useState(null);

  const rightRef = useRef(null);
  const leftRef = useRef(null);

  const toggleRight = () => {
    setIsRightOpen(prev => !prev);
    if (isLeftOpen) setIsLeftOpen(false);
  };

  const toggleLeft = () => {
    setIsLeftOpen(prev => !prev);
    if (isRightOpen) setIsRightOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rightRef.current && !rightRef.current.contains(event.target)) {
        setIsRightOpen(false);
      }
      if (leftRef.current && !leftRef.current.contains(event.target)) {
        setIsLeftOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // دیتا برای گزینه‌ها (می‌تونی هر متنی بذاری)
  const rightOptions = ['انتخاب ترم 1', 'انتخاب ترم 2', 'انتخاب ترم 3'];
  const leftOptions = ['انتخاب ترم A', 'انتخاب ترم B', 'انتخاب ترم C'];

  return (
    <div className={style.IssueReportCard}>
      <div className={style.selector}>
        {/* Right */}
        <div ref={rightRef} className={style.right} onClick={toggleRight}>
          <div className={style.arrow}>
            {/* svg icon */}
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="#69B0B2"/>
            </svg>
          </div>
          <div className={style.classes}>
            <p>کلاس دوازدهم شبکه</p>
          </div>
          <div className={`${style.dropdown} ${isRightOpen ? style.open : style.closed}`}>
            <ul>
              {rightOptions.map((option, index) => (
                <li 
                  key={index} 
                  className={style.option}
                  onClick={(e) => {
                    e.stopPropagation(); // جلوگیری از بسته شدن فوری
                    setSelectedRightIndex(index);
                    setIsRightOpen(false); // 👈 اضافه کن تا بسته بشه
                  }}
                >
                  <div className={style.circle}>
                    {selectedRightIndex === index && <div className={style.filled}></div>}
                  </div>
                  <p>{option}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Left */}
        <div ref={leftRef} className={style.left} onClick={toggleLeft}>
          <div className={style.arrow}>
            {/* svg icon */}
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="#69B0B2"/>
            </svg>
          </div>
          <div className={style.classes}>
            <p>خرداد - پایانی</p>
          </div>
          <div className={`${style.dropdown} ${isLeftOpen ? style.open : style.closed}`}>
            <ul>
              {leftOptions.map((option, index) => (
                <li 
                  key={index} 
                  className={style.option}
                  onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeftIndex(index);
                  setIsLeftOpen(false); // 👈 اضافه کن تا بسته بشه
                }}

                >
                  <div className={style.circle}>
                    {selectedLeftIndex === index && <div className={style.filled}></div>}
                  </div>
                  <p>{option}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
         {/* Dropdown Button */}
<div ref={menuRef} className={style.printMenuContainer}>
  <button
    className={style.printMenuButton}
    onClick={() => setIsMenuOpen(prev => !prev)}
  >
    <img src={Print} alt="" />
    <p>صدور کارنامه</p>
  </button>

  {isMenuOpen && (
    <div className={style.dropdownMenu}>
      <ul>
        <li onClick={() => {
          setIsMenuOpen(false);
          // پرینت کل مدرسه
          console.log("پرینت برای کل مدرسه");
        }}>
          کل مدرسه
        </li>
        <li onClick={() => {
          setIsMenuOpen(false);
          // پرینت کلاس فعلی
          console.log("پرینت برای کلاس فعلی");
        }}>
          کلاس کنونی
        </li>
      </ul>
    </div>
  )}
</div>


      </div>
    </div>
  );
}
