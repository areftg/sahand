import React, { useState, useEffect, useCallback } from 'react';
import api, { endpoints, setAuthToken } from "../config/api.js";
import { useAuth } from './AuthContext.jsx';
import styles from "./ChangeSchool.module.css";
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner.jsx';
import BuildingIcon from '../assets/icons/building_icon.svg';
import SchoolIcon1 from '../assets/icons/school_icon_1.png';
import { useNavigate } from 'react-router-dom';

function SchoolSelector({ onSchoolSelected }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const isParent = user?.roles?.includes('parent') || user?.role?.name === 'parent';

  const getRoleName = (roles) => {
    if (!roles) return 'نقش نامشخص';
    const roleMap = {
      'admin': 'مدیر کل', 'deputy': 'معاون', 'principal': 'مدیر مدرسه',
      'teacher': 'معلم', 'parent': 'والدین'
    };
    if (Array.isArray(roles)) {
      return roles.map(role => roleMap[role] || 'نقش نامشخص').join('، ');
    }
    return roleMap[roles] || 'نقش نامشخص';
  };

  // 📍 useCallback را به handleSelect اضافه می‌کنیم تا از اجرای مجدد غیرضروری جلوگیری شود
  const handleSelect = useCallback((item) => {
    if (!user) return;
    const isAdmin = user?.role?.name === 'admin';

    const updatedUser = {
      ...user,
      roles: isAdmin ? ["admin"] : item.current_user_roles || (isParent ? ["parent"] : []),
      selectedSchool: isParent ? item.active_enrollment?.class?.school?.id : item.id,
      school_id: isParent ? item.active_enrollment?.class?.school?.id : item.id,
      school: isParent ? item.id : item?.name,
      
      // 📍 تغییر اصلی اینجاست: به جای ID، کل آبجکت فرزند را ذخیره می‌کنیم
      selected_child: isParent ? item : null,
      
      // برای دسترسی راحت‌تر، ID را هم جداگانه ذخیره می‌کنیم
      selected_child_id: isParent ? item.id : null,
    };
   
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setSelectedItemId(item.id);

    if (updatedUser.roles && updatedUser.roles.length > 0) {
      if (isParent) {
        navigate('/Parent', { replace: true });
      } else if (updatedUser.roles.includes('teacher')) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/hozor', { replace: true });
        }, 500);
      } else {
        navigate('/', { replace: true });
      }
    } else {
      console.warn("نقش کاربر تعریف نشده!");
    }

    if (onSchoolSelected) {
      onSchoolSelected(isParent ? item.active_enrollment?.class?.school?.id : item.id);
    }
  }, [user, setUser, isParent, navigate, onSchoolSelected]); // وابستگی‌های useCallback


  useEffect(() => {
    async function fetchData() {
      if (!user?.token) return;
      setLoading(true); // نمایش لودینگ در ابتدای هر fetch

      try {
        setAuthToken(user.token);
        let response;
        if (isParent) {
          response = await api.get(endpoints.children);
        } else {
          response = await api.get(endpoints.schools);
        }
        const data = response.data.data;
        setItems(data);
        
        if (data.length === 1) {
          handleSelect(data[0]);
        }
      } catch (error) {
        console.error(isParent ? 'خطا در دریافت فرزندان:' : 'خطا در دریافت مدارس:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) {
      fetchData();
    }
  }, [user, isParent, handleSelect]);

  
  if (loading) {
    return (
      <div className={styles.schoolListContainer}>
        <h1>{isParent ? 'در حال دریافت اطلاعات فرزندان...' : 'در حال دریافت اطلاعات مدارس...'}</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return <div className={styles.schoolListContainer}><h1>{isParent ? 'فرزندی برای نمایش وجود ندارد.' : 'مدرسه‌ای یافت نشد.'}</h1></div>;
  }

  // اگر فقط یک آیتم وجود دارد، به دلیل انتخاب خودکار، پیام "در حال ورود" نمایش داده می‌شود
  if (items.length === 1) {
    return (
        <div className={styles.schoolListContainer}>
            <LoadingSpinner />
            <p style={{marginTop: '20px'}}>
                {isParent ? `در حال ورود به پنل فرزند "${items[0].profile.first_name} ${items[0].profile.last_name}"...` : `در حال ورود به مدرسه "${items[0].name}"...`}
            </p>
        </div>
    );
  }

  return (
    <div className={styles.schoolListContainer}>
      <h1>{isParent ? 'فرزند مورد نظر را انتخاب کنید' : 'مدرسه مورد نظر را انتخاب کنید'}</h1>
       <div className={styles.list}>
      {items.map(item => {
        const isSelected = item.id === selectedItemId;
        const displayName = isParent ? `${item.profile.first_name} ${item.profile.last_name}` : item.name;
        const schoolName = isParent ? item.active_enrollment?.class?.school?.name : item.name;

        return (
          
          <div
            key={item.id}
            className={`${styles.schoolListItem} ${isSelected ? styles.selectedSchool : ''}`}
            onClick={() => handleSelect(item)}
          >
            <img src={SchoolIcon1} alt={displayName} className={styles.schoolItemIcon} />
            <div className={styles.schoolItemInfo}>
              <h3>{displayName}</h3>
              <div className={styles.schoolItemDetails}>
                <p className={styles.schoolType}>
                  <img src={BuildingIcon} alt='نوع' /> {schoolName || "مدرسه نامشخص"}
                </p>
                <p className={styles.schoolLocation}>
                  {isParent ? "فرزند" : getRoleName(item.current_user_roles)}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  );
}

export default SchoolSelector;