import React, { useState, useEffect, useRef } from 'react';
import styles from "./Headerdown.module.css";
import arrow from "../../assets/icons/Drop.svg";
import bell from "../../assets/icons/Alarm-set.svg";
import Logout from "../../assets/icons/Logout.svg";
import hozor from "../../assets/icons/hozor&ghiyab.svg";
import record from "../../assets/icons/record.svg";
import editprofile from "../../assets/icons/editprofile.svg";
import editschool from "../../assets/icons/editschool.svg";
import dashbord from "../../assets/icons/Dashboard.svg";
import profile from "../../assets/images/profile.png";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../Context/AuthContext";

// کامپوننت کامل و نهایی Listitem
const Listitem = ({ object, id, activeDropdownId, setActiveDropdownId }) => {
  const dropdownRef = useRef(null);
  const showitem = activeDropdownId === id;
  const navigate = useNavigate();

  // 1. تابع باز کردن منو
  // e.stopPropagation() حیاتی است تا این کلیک باعث بسته شدن منوهای دیگر نشود
  const handelopen = (e) => {
    e.stopPropagation(); 
    setActiveDropdownId(showitem ? null : id);
  };

  // 2. useEffect برای بستن منو با کلیک بیرون
  // این کد حالا به درستی کار می‌کند چون کلیک‌های داخلی توسط stopPropagation متوقف می‌شوند
  useEffect(() => {
    const handleClickOutside = (event) => {
      // اگر منو باز بود و بیرون آن کلیک شد، آن را ببند
      if (showitem && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showitem, setActiveDropdownId]); // وابستگی‌ها برای عملکرد بهتر

  // 3. تابع ناوبری
  const handleNavigate = (e, path) => {
    e.stopPropagation(); // این کلیک هم نباید باعث اجرای کدهای دیگر شود
    navigate(path);
    setActiveDropdownId(null);
  };

  return (
    <div className={`${styles.dropdown} ignore-closes`} ref={dropdownRef}>
      <div className={styles.dropdowntitle} onClick={handelopen}>
        <img src={arrow} alt="" style={{ transform: showitem ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        <div className={styles.dropdowntitleinfo}>
          {object.position && <p className={styles.dropdowntitleinfopos}>سمت : {object.position}</p>}
          <p>{object.name}</p>
          <img src={object.image} alt="" />
        </div>
      </div>
      {showitem && (
        <div className={styles.dropdownContentWrapper}>
          <div onClick={(e) => handleNavigate(e, '/EditUser')} className={`${styles.dropdowncontent} ignore-closes`}>
            <p>{object.itemonetext}</p>
            {object.itemoneimg && <img src={object.itemoneimg} alt="" />}
          </div>
          <div onClick={(e) => handleNavigate(e, '/EditSchool')} className={`${styles.dropdowncontent} ignore-closes`}>
            <p>{object.itemtwotext}</p>
            {object.itemtwoimg && <img src={object.itemtwoimg} alt="" />}
          </div>
        </div>
      )}
    </div>
  );
};


// کامپوننت اصلی Headerdown
export default function Headerdown({ headerdown }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  // State برای مدیریت اینکه کدام زیرمنو باز است، در والد قرار دارد
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
  };

  const handleNavigate = (e, path) => {
    e.stopPropagation();
    navigate(path);
    if(headerdown) headerdown(); // بستن کل منوی اصلی
  };

  const getRoleName = (role) => {
    const roleMap = { 'admin': 'مدیر کل', 'deputy': 'معاون', 'principal': 'مدیر مدرسه', 'teacher': 'معلم', 'parent': 'والدین' };
    return roleMap[role] || 'نقش نامشخص';
  };
  const userName = user ? `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}` : "کاربر مهمان";
  const userRole = user && user.roles ? getRoleName(user.roles[0]) : "";
  const objects = [
    { name: userName, position: userRole, image: profile, itemonetext: "ویرایش اطلاعات کاربری", itemtwotext: "ویرایش اطلاعات مدرسه", itemoneimg: editprofile, itemtwoimg: editschool },
    // { name: "زنگ هوشمند", image: bell, itemonetext: "زدن زنگ بصورت دستی", itemtwotext: "زنگ اتوماتیک", itemone: true, itemtwo: true }
  ];

  return (
    <div className={styles.headerlist}>
      {objects.map((item, index) => (
        <Listitem
          key={index}
          id={index}
          object={item}
          activeDropdownId={activeDropdownId}
          setActiveDropdownId={setActiveDropdownId}
        />
      ))}

      <div onClick={(e) => handleNavigate(e, '/')} className={styles.listitem}>
        ورود به داشبورد<img src={dashbord} alt='' />
      </div>
      <div onClick={(e) => handleNavigate(e, '/Hozor')} className={styles.listitem}>
        ورود به بخش حضور غیاب<img src={hozor} alt='' />
      </div>
      
      <button type="button" onClick={handleLogout} className={styles.listitem}>
        خروج از حساب کاربری<img src={Logout} alt='' />
      </button>
    </div>
  );
}