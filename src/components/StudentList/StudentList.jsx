
import style from "./StudentList.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

import Dropdown from "../DropDown/DropDown";
import api, { endpoints } from "../../config/api";
import deleteIcon from "../../assets/icons/delete.svg";
import editIcon from "../../assets/icons/edit.svg";
import searchIcon from "../../assets/icons/search.svg";
import QuestionBox from "../QuestionBox/QuestionBox"

// هوک useDebounce برای ایجاد تاخیر در اجرای جستجو پس از تایپ کاربر
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
const toPersianDigits = (num) => {
    // اگر ورودی null یا undefined است، همان را برگردان
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

export default function StudentList() {
    const [isBoxopen, setisBoxopen] = useState(false);
     const [isBoxloading, setisboxloading] = useState(false);
    const [enrolment, setenrolment] = useState(null); // در کد شما enrolment بود، بهتر است از نامی مثل studentIdToDelete استفاده شود
    // State های اصلی کامپوننت
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // State برای صفحه‌بندی و بارگذاری بیشتر (Infinite Scroll)
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    // State برای فیلترها و مرتب‌سازی
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("student_code-asc");
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);

    // Debounce کردن ترم جستجو برای جلوگیری از درخواست‌های مکرر API هنگام تایپ
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Ref ها برای مدیریت وضعیت‌های داخلی بدون ایجاد رندر مجدد
    const isInitialMount = useRef(true);
    const isLoadingMore = useRef(false);
    const scrollContainerRef = useRef(null); // جدید: Ref برای کانتینر اسکرول جدول

    // تابع اصلی دریافت لیست دانشجویان از سرور
    const fetchStudents = useCallback(async (currentPage, isNewSearch) => {
        if (isNewSearch) {
            isLoadingMore.current = false;
        }
        setLoading(true);

        if (isNewSearch) {
            setStudents([]);
        }

        try {
            const [sortField, sortDir] = sortBy.split('-');

            const response = await api.get(endpoints.students(debouncedSearchTerm, currentPage, sortField, sortDir, selectedClassId));
            const responseData = response.data;
            const newStudents = Array.isArray(responseData.data) ? responseData.data : [];

            setStudents(prevStudents => isNewSearch ? newStudents : [...prevStudents, ...newStudents]);
            setHasNextPage(responseData.links.next !== null);
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
    }, [debouncedSearchTerm, sortBy, selectedClassId]);

    // --- مدیریت افکت‌های بارگذاری داده ---

    // Effect 1: بارگذاری داده‌های اولیه (کلاس‌ها و اولین صفحه دانشجویان) فقط یک بار در زمان mount شدن
    useEffect(() => {
        const fetchClassesData = async () => {
            try {
                const response = await api.get(endpoints.classes());
                const classData = response.data.data || response.data;
                if (Array.isArray(classData)) {
                    setClasses(classData);
                } else {
                    console.warn("پاسخ دریافتی برای لیست کلاس‌ها یک آرایه معتبر نیست:", response.data);
                    setClasses([]);
                }
            } catch (err) {
                console.error("خطا در دریافت لیست کلاس‌ها:", err);
                setError(prevError => (prevError ? prevError + " | " : "") + "خطا در بارگذاری لیست کلاس‌ها.");
            }
        };

        fetchClassesData();
        fetchStudents(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Effect 2: رسیدگی به تغییرات فیلترها (جستجو، مرتب‌سازی، تغییر کلاس)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setPage(1);
        setHasNextPage(true);
        fetchStudents(1, true);

    }, [debouncedSearchTerm, sortBy, selectedClassId]);

    // --- مدیریت افکت‌های اسکرول و بارگذاری بیشتر ---

    // Effect 3: بارگذاری صفحات بعدی (هنگام تغییر state صفحه در اثر اسکرول)
    useEffect(() => {
        if (page > 1) {
            fetchStudents(page, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // تابع مدیریت رویداد اسکرول - اصلاح شده برای کانتینر داخلی
    const handleScroll = useCallback(() => {
        if (isLoadingMore.current || !hasNextPage) return;

        const container = scrollContainerRef.current;
        if (container) {
            // محاسبه برای کانتینر داخلی: element.scrollTop + element.clientHeight >= element.scrollHeight - threshold
            const threshold = 100; // فاصله تا انتها برای شروع بارگذاری
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
                isLoadingMore.current = true;
                setPage(prevPage => prevPage + 1);
            }
        }
    }, [hasNextPage]);

    // Effect 4: افزودن و حذف listener اسکرول به کانتینر جدول - اصلاح شده
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

    // Effect 5: بارگذاری خودکار در صورتی که محتوای اولیه کل کانتینر را پر نکند - اصلاح شده
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!loading && hasNextPage && !isLoadingMore.current && students.length > 0 && container) {
            // بررسی قابلیت اسکرول بودن کانتینر داخلی
            const canScroll = container.scrollHeight > container.clientHeight;
            if (!canScroll) {
                isLoadingMore.current = true;
                setPage(prevPage => prevPage + 1);
            }
        }
    }, [loading, hasNextPage, students]);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };

    // ======================= شروع بخش اصلاح شده =======================

    // مرحله 1: تابع handleDelete برای آماده‌سازی عملیات حذف
    const handleDelete = (enrolmentid) => {
        setenrolment(enrolmentid); // شناسه دانش‌آموز مورد نظر را در state ذخیره کن
        setisBoxopen(true);       // پنجره تأیید را باز کن
    };

    // مرحله 2: تابع handleCancelDelete برای لغو عملیات
    const handleCancelDelete = () => {
        setisBoxopen(false);  // پنجره را ببند
        setenrolment(null);   // شناسه ذخیره شده را پاک کن
    };

    // مرحله 3: تابع handleConfirmDelete برای اجرای عملیات پس از تأیید
    const handleConfirmDelete = async () => {
        if (!enrolment) return; // اگر شناسه‌ای وجود نداشت، کاری نکن
         setisboxloading(true);
        const payload = {
            status: 'dropout'
        };
        

        try {
            await api.put(endpoints.studentstatus(enrolment), payload);
            // پس از حذف موفق، لیست را مجدداً بارگذاری کن تا تغییرات نمایش داده شود
            fetchStudents(1, true);
        } catch (err) {
            console.error("خطا در حذف دانش‌آموز:", err);
            // می‌توانید یک پیام خطا به کاربر نمایش دهید
            setError("عملیات حذف با خطا مواجه شد.");
              setisboxloading(false)
        } finally {
            // در هر صورت (موفق یا ناموفق) پنجره را ببند
            handleCancelDelete();
            setisboxloading(false)
        }
    };

    // ======================== پایان بخش اصلاح شده ========================

    const handleEdit = (studentId) => {
        navigate(`/AddStudent/${studentId}`);
    };

    const sortOptions = [
        { value: "student_code-asc", label: "کد دانش آموزی (صعودی)" },
        { value: "student_code-desc", label: "کد دانش آموزی (نزولی)" },
        { value: "last_name-asc", label: "نام خانوادگی (صعودی)" },
        { value: "last_name-desc", label: "نام خانوادگی (نزولی)" },
    ];

    const classOptions = [
        { value: null, label: "تمامی کلاس ها" },
        ...(Array.isArray(classes) ? classes.map(cls => ({ value: cls.id, label: cls.name })) : [])
    ];

    // --- رندر کردن ردیف‌های جدول ---
    const renderStudentRows = () => {
        if (loading && page === 1) {
            return Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} height={60} count={1} duration={2} highlightColor="#69b0b2" />
            ));
        }

        if (error) {
            return <div className={style.errorState}><p>{error}</p></div>;
        }

        if (students.length === 0 && !loading) {
            return <div className={style.emptyState}><p>دانش‌آموزی یافت نشد.</p></div>;
        }

        return students.map(student => (
            <div key={`${student.id}-${student.national_code}`} className={style.row}>
                <div className={`${style.item} ${style.displayon}`}><p> <ScrollableText text={`${student.profile?.first_name} ${student.profile?.last_name} ` || '---'} /></p></div>
                <div className={`${style.item} ${style.display}`}><p><ScrollableText text={student.profile?.first_name || '---'} /></p></div>
                <div className={`${style.item} ${style.display}`}><p><ScrollableText text={student.profile?.last_name || '---'} /> </p></div>
                <div className={`${style.item} ${style.display}`}><p><ScrollableText text={student?.father_name || '---'} /> </p></div>
                <div className={style.item}><p>{toPersianDigits(student.profile?.national_code) || '---'}</p></div>
                <div className={style.item}><ScrollableText text={student.active_enrollment.class?.name || '---'} /> </div>
                {/* مرحله 4: اصلاح onClick دکمه حذف */}
                <div className={style.delete} onClick={() => handleDelete(student?.active_enrollment.id)}><img src={deleteIcon} alt="حذف" /><p>حذف</p></div>
                <div className={`${style.edit}`} onClick={() => handleEdit(student.id)}><img src={editIcon} alt="ویرایش" /><p>ویرایش</p></div>
            </div>
        ));
    };

    // --- JSX نهایی کامپوننت ---
    return (
        <div className={style.container}>
            {/* مرحله 5: اصلاح فراخوانی QuestionBox */}
            {isBoxopen && <QuestionBox message={"آیا از حذف دانش‌آموز مطمعن هستید؟ ‌‌‌‌(دانش آموز حذف نمی شود میشود)"} onConfirm={handleConfirmDelete} isLoading={isBoxloading} onCancel={handleCancelDelete} />}

            <div className={style.header}>
                <div className={style.right}>
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.1704 0.958984C9.42025 0.958984 7.99732 2.33879 7.99732 4.03591C7.99732 5.73302 9.42025 7.11283 11.1704 7.11283C12.9205 7.11283 14.3435 5.73302 14.3435 4.03591C14.3435 2.33879 12.9205 0.958984 11.1704 0.958984ZM3.674 7.68975C3.30712 7.73783 2.98981 7.99745 2.80141 8.45898L0.500927 15.7282C0.248072 16.4686 0.619918 17.2186 1.25453 17.3436L2.80141 17.6898C3.43602 17.8148 4.06072 17.4686 4.18963 16.7282L5.97448 9.3436C6.10339 8.72821 5.69684 8.08398 5.06223 7.95898L4.07064 7.72821C3.94173 7.69937 3.79795 7.67533 3.674 7.68975ZM8.2353 8.3436C7.60069 8.3436 7.36271 9.07437 7.36271 9.07437C6.857 11.1657 5.58777 16.7186 5.45886 17.459C5.206 18.6898 5.82575 19.6753 6.33146 20.5359C6.83717 21.2763 12.9404 30.6224 13.8278 31.7282C14.5914 32.7138 15.345 33.1898 16.4853 32.5744C17.3728 32.084 17.2687 30.858 16.7629 29.9974C16.2572 29.1369 10.0202 19.3051 10.0202 19.3051L11.2894 14.9974C11.2894 14.9974 12.0579 15.959 12.4396 16.5744C12.5685 16.8196 12.8065 16.9446 13.3122 17.1898C13.9468 17.4349 15.3648 18.3196 16.1283 18.6898C16.8919 19.0599 17.7694 19.1609 18.1512 18.4205C18.5329 17.8051 18.0322 17.0888 17.3976 16.8436C16.7629 16.5984 14.1055 14.9974 14.1055 14.9974C14.1055 14.9974 12.6875 12.0263 11.924 10.3051C11.1605 8.82918 10.6796 8.3436 9.66319 8.3436H8.2353ZM27.0358 9.57437C25.6327 9.57437 24.4973 10.6753 24.4973 12.0359C24.4973 13.3965 25.6327 14.4974 27.0358 14.4974C28.4389 14.4974 29.5742 13.3965 29.5742 12.0359C29.5742 10.6753 28.4389 9.57437 27.0358 9.57437ZM22.0778 14.6128C21.6961 14.6128 21.3342 14.858 21.2053 15.2282L19.5394 20.5359C19.2865 21.0263 19.5493 21.5263 20.055 21.6513L21.3242 21.8821C21.706 22.0071 22.2266 21.6369 22.3555 21.2667L23.6247 15.8436C23.7536 15.3532 23.3719 15.0071 22.9901 14.8821L22.0778 14.6128ZM24.894 15.7282C24.3882 15.7282 24.2593 16.2282 24.2593 16.2282C23.8776 17.7042 23.119 21.0359 22.9901 21.6513C22.8612 22.6369 23.243 23.2282 23.6247 23.8436C24.0065 24.334 28.424 31.2186 29.0586 31.959C29.6932 32.6994 30.1989 33.0648 30.9625 32.5744C31.5971 32.2042 31.6219 31.3436 31.2401 30.7282C30.8583 30.1128 26.2822 22.9974 26.2822 22.9974L27.0358 20.5359L27.7894 21.6513C27.9183 21.8965 28.0422 21.8676 28.424 22.1128C28.8058 22.358 30.4468 23.0984 31.0815 23.3436C31.5872 23.5888 32.3755 23.7186 32.6283 23.2282C33.0101 22.7378 32.7374 22.2426 32.2317 21.9974L29.1776 20.5359C29.1776 20.5359 28.186 18.2955 27.5514 17.1898C27.0457 16.084 26.6491 15.7282 25.8855 15.7282H24.894ZM5.33987 22.1128L4.30862 25.5744C4.30862 25.5744 1.66108 29.2811 0.897562 30.2667C0.391853 31.0071 -0.118814 31.9878 0.897562 32.7282C1.91394 33.4686 2.81132 32.459 3.31703 31.8436C3.82274 31.3532 5.85549 28.5455 6.49011 27.8051C6.87187 27.3148 7.11481 26.9446 7.24372 26.5744C7.37262 26.3292 7.50649 26.0744 7.75934 25.459L5.33987 22.1128ZM23.1091 24.8436L22.3555 27.4205C22.3555 27.4205 20.4417 30.1417 19.936 30.8821C19.5543 31.4974 19.1725 32.084 19.936 32.5744C20.6995 33.1898 21.3391 32.4494 21.7209 31.959C22.1026 31.5888 23.5999 29.5263 23.9817 29.0359C24.2346 28.6657 24.3684 28.3965 24.4973 28.1513C24.6262 27.9061 24.765 27.6801 24.894 27.1898L23.1091 24.8436Z" fill="white"></path>
                    </svg>
                    <h1>لیست دانش آموزان</h1>
                </div>
                <div className={style.left}>
                    <div className={`${style.filter} ${style.display}`}>
                        <Dropdown
                            options={classOptions}
                            defualt={"تمامی کلاس ها"}
                            onSelect={(option) => setSelectedClassId(option.value)}
                            mobileBehavior="icon"
                            isOpen={activeDropdown === 'class-filter'}
                            onToggle={() => handleDropdownToggle('class-filter')}

                        />

                    </div>
                    <div className={style.filter}>
                        <Dropdown
                            options={sortOptions}
                            defualt={"نام خانوادگی (صعودی)"}
                            onSelect={(option) => setSortBy(option.value)}
                            mobileBehavior="icon"
                            isOpen={activeDropdown === 'sort-filter'}
                            onToggle={() => handleDropdownToggle('sort-filter')}
                        />
                    </div>
                    <div className={style.search}>
                        <input
                            type="text"
                            placeholder="جستجو ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <img src={searchIcon} alt="جستجو" />
                    </div>
                </div>
            </div>

            {/* جدید: افزودن ref به کانتینر جدول */}
            <div ref={scrollContainerRef} className={style.table}>
                {renderStudentRows()}
                {loading && page > 1 && (
                    <div className={style.loadingMore}>
                        <p>در حال بارگذاری موارد بیشتر...</p>
                        <LoadingSpinner />
                    </div>
                )}

                {!hasNextPage && students.length > 0 && !loading && (
                    <div className={style.endOfList}>
                        <p>به انتهای لیست رسیدید.</p>
                    </div>
                )}
            </div>


        </div>
    );
}