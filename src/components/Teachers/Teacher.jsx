import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import QuestionBox from "../QuestionBox/QuestionBox"; // اضافه شد

import style from "./Teacher.module.css";
import Dropdown from "../DropDown/DropDown";
import deleteIcon from "../../assets/icons/delete.svg";
import editIcon from "../../assets/icons/edit.svg";
import teacherwhite from "../../assets/icons/teacherwhite.svg";
import api, { endpoints } from "../../config/api";

const toPersianDigits = (num) => {
  if (num === null || num === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const ScrollableText = ({ text }) => {
  const textRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflow(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <p
      ref={textRef}
      className={`${isOverflow ? style.scrollable : ""}`}
      title={text} // نمایش کامل متن روی hover
    >
      {text}
    </p>
  );
};


export default function Teacher() {
  // --- State های اصلی کامپوننت ---
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- State برای صفحه‌بندی و بارگذاری بیشتر ---
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  // --- State برای مرتب‌سازی ---
  const [sortBy, setSortBy] = useState("last_name-asc");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- State های جدید برای منطق حذف ---
  const [isBoxopen, setisBoxopen] = useState(false);
  const [isBoxloading, setisboxloading] = useState(false);
  const [teacherIdToDelete, setTeacherIdToDelete] = useState(null);

  // --- Ref ها برای مدیریت وضعیت‌های داخلی ---
  const isInitialMount = useRef(true);
  const isLoadingMore = useRef(false);
  const scrollContainerRef = useRef(null);

  // --- تابع اصلی دریافت لیست دبیران از سرور ---
  const fetchTeachers = useCallback(async (currentPage, isNewSort) => {
    if (isLoadingMore.current && !isNewSort) return;

    setLoading(true);
    if (isNewSort) {
      setTeachers([]);
    } else {
      isLoadingMore.current = true;
    }

    try {
      const [sortField, sortDir] = sortBy.split('-');
      const response = await api.get(endpoints.teachers(currentPage, sortField, sortDir));
      const responseData = response.data;
      const newTeachers = Array.isArray(responseData.data) ? responseData.data : [];

      setTeachers(prevTeachers => isNewSort ? newTeachers : [...prevTeachers, ...newTeachers]);
      setHasNextPage(responseData.links?.next !== null);
      setError(null);

    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
      if (serverMessage) {
        setError(`پیام سرور: ${serverMessage}`);
      } else if (err.request) {
        setError("خطای شبکه: پاسخی از سرور دریافت نشد.");
      } else {
        setError(`خطای ناشناخته در تنظیم درخواست: ${err.message}`);
      }
    } finally {
      setLoading(false);
      isLoadingMore.current = false;
    }
  }, [sortBy]);

  // Effect 1: بارگذاری اولیه داده‌ها
  useEffect(() => {
    fetchTeachers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: رسیدگی به تغییر مرتب‌سازی
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    setHasNextPage(true);
    fetchTeachers(1, true);
  }, [sortBy, fetchTeachers]);

  // Effect 3: بارگذاری صفحات بعدی هنگام تغییر state صفحه
  useEffect(() => {
    if (page > 1) {
      fetchTeachers(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // --- مدیریت اسکرول و بارگذاری بیشتر ---
  const handleScroll = useCallback(() => {
    if (isLoadingMore.current || !hasNextPage) return;
    const container = scrollContainerRef.current;
    if (container) {
      const threshold = 100;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [hasNextPage]);

  // Effect 4: افزودن و حذف listener اسکرول
  useEffect(() => {
    const containerElement = scrollContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Effect 5: بارگذاری خودکار در صورتی که محتوا اولیه کل کانتینر را پر نکند
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!loading && hasNextPage && !isLoadingMore.current && teachers.length > 0 && container) {
      const canScroll = container.scrollHeight > container.clientHeight;
      if (!canScroll) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [loading, hasNextPage, teachers]);

  const handleDropdownToggle = (dropdownId) => {
    setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
  };

  // ======================= شروع بخش منطق حذف =======================

  const handleDelete = (teacherId) => {
    setTeacherIdToDelete(teacherId);
    setisBoxopen(true);
  };

  const handleCancelDelete = () => {
    setisBoxopen(false);
    setTeacherIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!teacherIdToDelete) return;
    setisboxloading(true);
    try {
      // توجه: فرض بر این است که یک اندپوینت برای حذف دبیر با متد DELETE وجود دارد
      // این اندپوینت ممکن است با اندپوینت لیست دبیران متفاوت باشد
      await api.delete(endpoints.deleteemployment(teacherIdToDelete));
      fetchTeachers(1, true); // بارگذاری مجدد لیست پس از حذف موفق
    } catch (err) {
      console.error("خطا در حذف دبیر:", err);
      setError("عملیات حذف با خطا مواجه شد.");
    } finally {
      handleCancelDelete(); // بستن مودال در هر صورت
      setisboxloading(false);
    }
  };

  // ======================== پایان بخش منطق حذف ========================

  const handleEdit = (teacherId) => {
    navigate(`/AddTeacher/${teacherId}`);
  };

  const sortOptions = [
    { value: "last_name-asc", label: "نام خانوادگی (صعودی)" },
    { value: "last_name-desc", label: "نام خانوادگی (نزولی)" },
    { value: "personnel_code-asc", label: "کد پرسنلی (صعودی)" },
    { value: "personnel_code-desc", label: "کد پرسنلی (نزولی)" },
  ];

  const renderTeacherRows = () => {
    if (loading && page === 1) {
      return Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} height={60} count={1} duration={2} highlightColor="#69b0b2" />
      ));
    }

    if (error) {
      return <div className={style.errorState}><p>{error}</p></div>;
    }

    if (teachers.length === 0 && !loading) {
      return <div className={style.emptyState}><p>دبیری یافت نشد.</p></div>;
    }

    return teachers.map(teacher => (
      <div className={style.row} key={`${teacher.id}-${teacher.profile.national_code}`}>
        <div className={` ${style.item} ${style.display}`}><p><ScrollableText text={teacher.profile.first_name || '---'} /></p></div>
        <div className={`${style.item} ${style.display}`}><p><ScrollableText text={teacher.profile.last_name || '---'} /></p></div>
        <div className={`${style.item} ${style.displaynone}`}><p><ScrollableText text={`${teacher.profile.first_name} ${teacher.profile.last_name}` || '---'} /></p></div>
        <div className={`${style.item} ${style.display}`}><p> <ScrollableText text={teacher.personnel_code  || '---'} /></p></div>
        <div className={`${style.item}`}><p>{toPersianDigits(teacher.profile.national_code) || '---'}</p></div>
        <div className={style.delete} onClick={() => handleDelete(teacher.profile.user.active_employments[0].id)}>
          <img src={deleteIcon} alt="حذف" /> <p>حذف</p>
        </div>
        <div className={style.edit} onClick={() => handleEdit(teacher.id)}>
          <img src={editIcon} alt="ویرایش" /> <p>ویرایش</p>
        </div>
      </div>
    ));
  };

  return (
    <div className={style.container}>
      {/* مودال تایید حذف در اینجا رندر می‌شود */}
      {isBoxopen && <QuestionBox message={"آیا از حذف این دبیر اطمینان دارید؟"} onConfirm={handleConfirmDelete} isLoading={isBoxloading} onCancel={handleCancelDelete} />}

      <div className={style.header}>
        <div className={style.right}>
          <img src={teacherwhite} alt='' />
          <h1>لیست دبیران</h1>
        </div>
        <div className={style.left}>
            <Dropdown
              options={sortOptions}
              defualt={"نام خانوادگی (صعودی)"}
              onSelect={(option) => setSortBy(option.value)}
              mobileBehavior="icon"
              isOpen={activeDropdown === 'teacher-sort'}
              onToggle={() => handleDropdownToggle('teacher-sort')}
            />
        </div>
      </div>

      <div ref={scrollContainerRef} className={style.table}>
        {renderTeacherRows()}

        {loading && page > 1 && (
          <div className={style.loadingMore}>
            <p>در حال بارگذاری موارد بیشتر...</p>
            <LoadingSpinner />
          </div>
        )}

        {!hasNextPage && teachers.length > 0 && !loading && (
          <div className={style.endOfList}>
            <p>به انتهای لیست رسیدید.</p>
          </div>
        )}
      </div>
    </div>
  );
}