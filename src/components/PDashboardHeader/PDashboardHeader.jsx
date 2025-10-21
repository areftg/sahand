import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "./PDashboardHeader.module.css";
import LastScore from "../../assets/icons/LastScore.svg";
import Subtract from "../../assets/icons/Subtract.svg";
import AbsenceIcon from "../../assets/icons/Subtract.svg";
import morkhasi from "../../assets/icons/Morkhasi.svg";
import Call from "../../assets/icons/Call.svg";

export default function PDashboardHeader() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 450);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  // مسیرهای واقعی کامل
  const menuItems = [
    { label: "مشاهده آخرین کارنامه", path: "/Parent/Dashboard", icon: LastScore },
    { label: "مشاهده فهرست غیبت‌ها", path: "/Parent/Dashboard/PAbsenceList", icon: Subtract },
    { label: "مشاهده نمودار غیبت‌ها", path: "/Parent/Dashboard/PAbsenceGraph", icon: AbsenceIcon },
    { label: "درخواست مرخصی", path: "/Parent/Dashboard/PLeave", icon: morkhasi },
    { label: "اطلاعات تماس مدرسه", path: "/Parent/Dashboard/PCallSchool", icon: Call },
  ];

  // تعیین گزینه انتخاب‌شده بر اساس مسیر فعلی
  useEffect(() => {
    const current = menuItems.find(item => location.pathname === item.path);
    if (current) setSelected(current);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 450);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    navigate(item.path); // مسیر کامل برای navigate
    setOpen(false);
  };

  // موبایل
  if (isMobile) {
  return (
    <div onClick={() => setOpen(prev => !prev)} ref={dropdownRef} className={style.dropdownWrapper}>
      <div className={style.selectbox}>
        {selected && (
          <>
            <img src={selected.icon} alt="" className={style.icon} />
            <span>{selected.label}</span>
          </>
        )}
      </div>

      {/* این خط تغییر کرده */}
      <div className={`${style.flesh} ${open ? style.flesh_active : ""}`}>
        <svg  width="27" height="16" viewBox="0 0 27 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.4082 9.96487L4.81098 1.36762C3.87948 0.436123 2.36748 0.436123 1.43598 1.36762C0.504478 2.29912 0.504478 3.81112 1.43598 4.74262L11.8175 15.1241C12.6972 16.0039 14.1215 16.0039 14.999 15.1241L25.3805 4.74262C26.312 3.81112 26.312 2.29912 25.3805 1.36762C24.449 0.436123 22.937 0.436123 22.0055 1.36762L13.4082 9.96487Z" fill="white"/>
        </svg>
      </div>

      {open && (
          <div className={style.dropdownMenu}>
            {menuItems.map(item => (
              <div
  key={item.path}
  className={style.dropdownItem}
  onClick={(e) => {
    e.stopPropagation(); // این خط از سرایت کلیک به بالا جلوگیری می‌کند
    handleSelect(item);  // سپس تابع اصلی شما اجرا می‌شود
  }}
>
  <img src={item.icon} alt="" className={style.icon} />
  <span>{item.label}</span>
</div>
            ))}
          </div>
        )}
    </div>
  );
}


  // دسکتاپ
  return (
    <div className={style.PDashboardHeader}>
      {menuItems.map(item => (
        <div
          key={item.path}
          className={style.button}
          onClick={() => handleSelect(item)}
        >
          <img src={item.icon} alt="" className={style.icon} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}