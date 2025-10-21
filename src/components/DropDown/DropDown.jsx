import React, { useState, useEffect, useRef } from "react";
import style from "./DropDown.module.css";
import Sort from "../../assets/icons/sort.svg";

const Dropdown = ({ options, onSelect, default: defaultLabel, mobileBehavior = 'dropdown', isOpen, onToggle, onScroll }) => {
  const [selected, setSelected] = useState(null);
  const [effectiveBehavior, setEffectiveBehavior] = useState(mobileBehavior);
  const dropdownRef = useRef(null);

  // بررسی عرض صفحه و تنظیم effectiveBehavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 430) {
        setEffectiveBehavior(mobileBehavior); // استفاده از mobileBehavior در موبایل
      } else {
        setEffectiveBehavior('dropdown'); // پیش‌فرض dropdown در دسکتاپ
      }
    };

    // بررسی اولیه
    handleResize();

    // اضافه کردن listener برای تغییرات اندازه صفحه
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBehavior]);

  useEffect(() => {
    if (options && options.length > 0 && !selected) {
      setSelected(options[0]);
      if (onSelect) onSelect(options[0]);
    }
  }, [options, selected, onSelect]);

  const handleSelect = (option) => {
    setSelected(option);
    if (onSelect) onSelect(option);
    onToggle();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) {
          onToggle();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  // اگه options خالی باشه، چیزی رندر نمی‌کنیم
  if (!options || options.length === 0) {
    return null;
  }

  // تعیین کلاس اصلی بر اساس effectiveBehavior
  const mainClassName = `${style.main} ${
    effectiveBehavior === 'icon' ? style.mobileAsIcon :
    effectiveBehavior === 'arrow' ? style.mobileAsArrow :
    style.mobileAsDropdown
  }`;

  return (
    <div ref={dropdownRef} className={mainClassName}>
      {/* آیکون مرتب‌سازی فقط برای حالت icon */}
      {effectiveBehavior === 'icon' && (
        <img className={style.sort} src={Sort} alt="Sort icon" onClick={onToggle} />
      )}

      {/* کانتینر دراپ‌داون یا آیکون فلش */}
      <div onClick={onToggle} className={`${style.container}  ${effectiveBehavior === 'arrow' ? style.squre : ''}`}>
        <svg
          className={`${style.arrow} ${isOpen ? style.rotated : ""} ${
            effectiveBehavior === 'arrow' ? style.arrowOnly : ''
          }`}
          width="26"
          height="16"
          viewBox="0 0 26 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.7354 9.53836L4.13812 0.94111C3.20662 0.00960922 1.69463 0.00960922 0.763126 0.94111C-0.168373 1.87261 -0.168373 3.38461 0.763126 4.31611L11.1446 14.6976C12.0244 15.5774 13.4486 15.5774 14.3261 14.6976L24.7076 4.31611C25.6391 3.38461 25.6391 1.87261 24.7076 0.94111C23.7761 0.00960922 22.2641 0.00960922 21.3326 0.94111L12.7354 9.53836Z"
            fill="black"
          />
        </svg>

        {/* دکمه فقط در حالت‌های غیر arrow نمایش داده می‌شه */}
        {effectiveBehavior !== 'arrow' && (
          <button className={style.button}>
            {selected ? selected.label : defaultLabel}
          </button>
        )}
      </div>

      <ul onScroll={onScroll} className={`${style.options} ${isOpen ? style.show : style.hide}`}>
        {options.map((option) => (
          <li
            className={style.option}
            key={option.value}
            onClick={() => handleSelect(option)}
          >
            <div className={style.circle}>
              {selected && selected.value === option.value && (
                <div className={style.filled}></div>
              )}
            </div>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dropdown;