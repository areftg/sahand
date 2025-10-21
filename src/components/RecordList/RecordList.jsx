//======================================================================
// فایل: RecordList.js (نسخه اصلاح شده بدون جستجو)
//======================================================================

import style from "./RecordList.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner"; // فرض می‌کنیم این کامپوننت را دارید

import Dropdown from "../DropDown/DropDown";
import api, { endpoints } from "../../config/api";
import History from "../../assets/icons/History.svg";
import Graph from "../../assets/icons/Graph.svg";
import MobileError from "../../components/Erorr/Types/MobileErorr";


const yearOptions = [
    { value: 1404, label: "سال ۱۴۰۴" },
    { value: 1403, label: "سال ۱۴۰۳" },
    { value: 1402, label: "سال ۱۴۰۲" },
];
const monthOptions = [
    { value: 1, label: "فروردین" }, { value: 2, label: "اردیبهشت" }, { value: 3, label: "خرداد" },
    { value: 4, label: "تیر" }, { value: 5, label: "مرداد" }, { value: 6, label: "شهریور" },
    { value: 7, label: "مهر" }, { value: 8, label: "آبان" }, { value: 9, label: "آذر" },
    { value: 10, label: "دی" }, { value: 11, label: "بهمن" }, { value: 12, label: "اسفند" },
];

export default function RecordList() {
    // --- State های مربوط به UI و وضعیت‌های متفرقه (بدون تغییر) ---
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const menuContainerRef = useRef(null); // برای منوی کارنامه
    
    // --- State های بازنگری شده برای داده، بارگذاری و فیلترها ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State برای صفحه‌بندی (جایگزین nextPageUrl و hasMore)
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    // State برای فیلترها
    const [sortBy, setSortBy] = useState("last_name-asc");
    const [classes, setClasses] = useState([]); // نام state از classOptions به classes تغییر کرد
    const [selectedClassId, setSelectedClassId] = useState(null);

    // State های مربوط به کارنامه (بدون تغییر)
    const [selectedYear, setSelectedYear] = useState({ value: 1404, label: "سال ۱۴۰۴" });
    const [selectedMonth, setSelectedMonth] = useState({ value: 6, label: "شهریور" });
    const [currentAcademicYearId, setCurrentAcademicYearId] = useState(null);

    // Ref ها برای مدیریت وضعیت‌های داخلی بدون رندر مجدد
    const isInitialMount = useRef(true);
    const isLoadingMore = useRef(false);
    const scrollContainerRef = useRef(null); // Ref برای کانتینر اسکرول جدول

    // --- افکت‌های مربوط به UI (بدون تغییر) ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && typeof activeDropdown === 'number' && menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDropdown]);


    // --- تابع اصلی دریافت لیست دانشجویان از سرور (بازنگری شده) ---
    const fetchStudents = useCallback(async (currentPage, isNewSearch) => {
        if (isNewSearch) {
            isLoadingMore.current = false; // جلوگیری از تداخل درخواست‌ها
        }
        setLoading(true);

        if (isNewSearch) {
            setStudents([]); // برای جستجوی جدید، لیست را خالی کن
        }

        try {
            const [sortField, sortDir] = sortBy.split('-');
            const response = await api.get(endpoints.studentsrecord(currentPage, sortField, sortDir, selectedClassId));
            const responseData = response.data;
            const newStudents = Array.isArray(responseData.data) ? responseData.data : [];

            setStudents(prevStudents => isNewSearch ? newStudents : [...prevStudents, ...newStudents]);
            setHasNextPage(responseData.links.next !== null);
            setError(null);
        } catch (err) {
            const serverMessage = err.response?.data?.message || err.response?.data?.error;
            setError(serverMessage || 'خطا در برقراری ارتباط با سرور');
        } finally {
            setLoading(false);
            isLoadingMore.current = false;
        }
    }, [ sortBy, selectedClassId]);

    
    // --- مدیریت افکت‌های بارگذاری داده (ساختار جدید) ---

    // Effect 1: بارگذاری داده‌های اولیه (کلاس‌ها و اولین صفحه دانشجویان) فقط یک بار
    useEffect(() => {
        const fetchClassesData = async () => {
            try {
                const response = await api.get(endpoints.classes());
                const classesArray = response.data.data || [];
                if (classesArray.length > 0 && classesArray[0].academic_year) {
                    setCurrentAcademicYearId(classesArray[0].academic_year.id);
                }
                setClasses(classesArray);
            } catch (err) {
                console.error("Failed to fetch classes:", err);
                setError(prev => (prev ? prev + " | " : "") + "خطا در بارگذاری کلاس‌ها.");
            }
        };

        fetchClassesData();
        if (!isMobile) {
            fetchStudents(1, true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]); // فقط در صورت تغییر وضعیت موبایل/دسکتاپ مجدد اجرا شود

    // Effect 2: رسیدگی به تغییرات فیلترها (مرتب‌سازی، کلاس)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (!isMobile) {
            setPage(1);
            setHasNextPage(true);
            fetchStudents(1, true);
        }
    }, [sortBy, selectedClassId, isMobile]); // <<< اصلاح شد: debouncedSearchTerm حذف شد

    // --- مدیریت افکت‌های اسکرول و بارگذاری بیشتر (ساختار جدید) ---

    // Effect 3: بارگذاری صفحات بعدی (هنگام تغییر state صفحه)
    useEffect(() => {
        if (page > 1 && !isMobile) {
            fetchStudents(page, false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isMobile]);

    // تابع مدیریت رویداد اسکرول برای کانتینر داخلی
    const handleScroll = useCallback(() => {
        if (isLoadingMore.current || !hasNextPage || isMobile) return;

        const container = scrollContainerRef.current;
        if (container) {
            const threshold = 100;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
                isLoadingMore.current = true;
                setPage(prevPage => prevPage + 1);
            }
        }
    }, [hasNextPage, isMobile]);

    // Effect 4: افزودن و حذف listener اسکرول به کانتینر جدول
    useEffect(() => {
        const containerElement = scrollContainerRef.current;
        if (containerElement && !isMobile) {
            containerElement.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (containerElement) {
                containerElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll, isMobile]);

    // --- توابع و گزینه‌های مربوط به UI (با کمترین تغییر) ---
    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };
    
    // توابع هندل کردن انتخاب دراپ‌داون‌ها
    const handleClassSelect = (option) => setSelectedClassId(option.value);
    const handleSortSelect = (option) => setSortBy(option.value);
    const handleYearSelect = (option) => setSelectedYear(option);
    const handleMonthSelect = (option) => setSelectedMonth(option);
    
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
    
    if (isMobile) {
        return <MobileError />;
    }

    // تابع رندر کردن محتوای جدول (با افزودن Skeleton)
    const renderContent = () => {
        if (loading && page === 1) {
            return Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} height={50} style={{ marginBottom: '10px' }} highlightColor="#69b0b2" />
            ));
        }
        if (error) return <div className={style.emptyState}><p>خطا: {error}</p></div>;
        if (students.length === 0 && !loading) return <div className={style.emptyState}><p>دانش آموزی یافت نشد.</p></div>;

        return students.map((student, index) => {
            const classId = student.active_enrollment?.class?.id;
            const firstName = student.profile?.first_name || '';
            const lastName = student.profile?.last_name || '';
            const nationalCode = student.profile?.national_code || '';

            return (
                <div className={style.row} key={student.id}>
                    <div className={`${style.item} ${style.display}`}><p>{index + 1}</p></div>
                    <div className={style.item}><p>{firstName}</p></div>
                    <div className={`${style.item} ${style.display}`}><p>{lastName}</p></div>
                    <div className={`${style.item} ${style.display}`}><p> نام پدر: {student.father_name || '-----------'}</p></div>
                    <Link to={`/student/${student.id}`} className={style.item}><img src={Graph} alt="مشاهده سوابق" /><p>مشاهده سوابق</p></Link>
                    <div className={style.actionsContainer} ref={activeDropdown === student.id ? menuContainerRef : null}>
                        <button className={style.actionButton} onClick={() => handleDropdownToggle(student.id)}>
                            <img src={History} alt="صدور کارنامه" />
                            <p>صدور کارنامه</p>
                        </button>
                        {activeDropdown === student.id && (
                            <div className={style.dropdownMenu}>
                                <Link
                                    to={`/record/${student.id}?year=${selectedYear.value}&month=${selectedMonth.value}&classId=${classId || ''}&academicYearId=${currentAcademicYearId || ''}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&nationalCode=${nationalCode}`}
                                    className={style.menuItem} target="_blank" onClick={() => setActiveDropdown(null)}
                                >
                                    نمره ماهیانه
                                </Link>
                                <Link
                                    to={`/record/${student.id}?type=detailed_transcript&year=${selectedYear.value}&month=${selectedMonth.value}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&nationalCode=${nationalCode}`}
                                    className={style.menuItem} target="_blank" onClick={() => setActiveDropdown(null)}
                                >
                                    ریز نمرات
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.right}>
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.1704 0.958984C9.42025 0.958984 7.99732 2.33879 7.99732 4.03591C7.99732 5.73302 9.42025 7.11283 11.1704 7.11283C12.9205 7.11283 14.3435 5.73302 14.3435 4.03591C14.3435 2.33879 12.9205 0.958984 11.1704 0.958984ZM3.674 7.68975C3.30712 7.73783 2.98981 7.99745 2.80141 8.45898L0.500927 15.7282C0.248072 16.4686 0.619918 17.2186 1.25453 17.3436L2.80141 17.6898C3.43602 17.8148 4.06072 17.4686 4.18963 16.7282L5.97448 9.3436C6.10339 8.72821 5.69684 8.08398 5.06223 7.95898L4.07064 7.72821C3.94173 7.69937 3.79795 7.67533 3.674 7.68975ZM8.2353 8.3436C7.60069 8.3436 7.36271 9.07437 7.36271 9.07437C6.857 11.1657 5.58777 16.7186 5.45886 17.459C5.206 18.6898 5.82575 19.6753 6.33146 20.5359C6.83717 21.2763 12.9404 30.6224 13.8278 31.7282C14.5914 32.7138 15.345 33.1898 16.4853 32.5744C17.3728 32.084 17.2687 30.858 16.7629 29.9974C16.2572 29.1369 10.0202 19.3051 10.0202 19.3051L11.2894 14.9974C11.2894 14.9974 12.0579 15.959 12.4396 16.5744C12.5685 16.8196 12.8065 16.9446 13.3122 17.1898C13.9468 17.4349 15.3648 18.3196 16.1283 18.6898C16.8919 19.0599 17.7694 19.1609 18.1512 18.4205C18.5329 17.8051 18.0322 17.0888 17.3976 16.8436C16.7629 16.5984 14.1055 14.9974 14.1055 14.9974C14.1055 14.9974 12.6875 12.0263 11.924 10.3051C11.1605 8.82918 10.6796 8.3436 9.66319 8.3436H8.2353ZM27.0358 9.57437C25.6327 9.57437 24.4973 10.6753 24.4973 12.0359C24.4973 13.3965 25.6327 14.4974 27.0358 14.4974C28.4389 14.4974 29.5742 13.3965 29.5742 12.0359C29.5742 10.6753 28.4389 9.57437 27.0358 9.57437ZM22.0778 14.6128C21.6961 14.6128 21.3342 14.858 21.2053 15.2282L19.5394 20.5359C19.2865 21.0263 19.5493 21.5263 20.055 21.6513L21.3242 21.8821C21.706 22.0071 22.2266 21.6369 22.3555 21.2667L23.6247 15.8436C23.7536 15.3532 23.3719 15.0071 22.9901 14.8821L22.0778 14.6128ZM24.894 15.7282C24.3882 15.7282 24.2593 16.2282 24.2593 16.2282C23.8776 17.7042 23.119 21.0359 22.9901 21.6513C22.8612 22.6369 23.243 23.2282 23.6247 23.8436C24.0065 24.334 28.424 31.2186 29.0586 31.959C29.6932 32.6994 30.1989 33.0648 30.9625 32.5744C31.5971 32.2042 31.6219 31.3436 31.2401 30.7282C30.8583 30.1128 26.2822 22.9974 26.2822 22.9974L27.0358 20.5359L27.7894 21.6513C27.9183 21.8965 28.0422 21.8676 28.424 22.1128C28.8058 22.358 30.4468 23.0984 31.0815 23.3436C31.5872 23.5888 32.3755 23.7186 32.6283 23.2282C33.0101 22.7378 32.7374 22.2426 32.2317 21.9974L29.1776 20.5359C29.1776 20.5359 28.186 18.2955 27.5514 17.1898C27.0457 16.084 26.6491 15.7282 25.8855 15.7282H24.894ZM5.33987 22.1128L4.30862 25.5744C4.30862 25.5744 1.66108 29.2811 0.897562 30.2667C0.391853 31.0071 -0.118814 31.9878 0.897562 32.7282C1.91394 33.4686 2.81132 32.459 3.31703 31.8436C3.82274 31.3532 5.85549 28.5455 6.49011 27.8051C6.87187 27.3148 7.11481 26.9446 7.24372 26.5744C7.37262 26.3292 7.50649 26.0744 7.75934 25.459L5.33987 22.1128ZM23.1091 24.8436L22.3555 27.4205C22.3555 27.4205 20.4417 30.1417 19.936 30.8821C19.5543 31.4974 19.1725 32.084 19.936 32.5744C20.6995 33.1898 21.3391 32.4494 21.7209 31.959C22.1026 31.5888 23.5999 29.5263 23.9817 29.0359C24.2346 28.6657 24.3684 28.3965 24.4973 28.1513C24.6262 27.9061 24.765 27.6801 24.894 27.1898L23.1091 24.8436Z" fill="white" /></svg>
                    <h1>لیست دانش آموزان</h1>
                    <p>۶۷۸ نفر غایب هستند.</p>
                </div>
                <div className={style.left}>
                    {/* بخش فیلترها */}
                    <Dropdown options={yearOptions} onSelect={handleYearSelect} defualt={selectedYear.label} mobileBehavior="icon" isOpen={activeDropdown === 'year'} onToggle={() => handleDropdownToggle('year')}/>
                    <Dropdown options={monthOptions} onSelect={handleMonthSelect} defualt={selectedMonth.label} mobileBehavior="icon" isOpen={activeDropdown === 'month'} onToggle={() => handleDropdownToggle('month')}/>
                    <Dropdown options={classOptions} onSelect={handleClassSelect} defualt={classOptions.find(opt => opt.value === selectedClassId)?.label || "تمامی کلاس ها"} mobileBehavior="icon" isOpen={activeDropdown === 'class'} onToggle={() => handleDropdownToggle('class')}/>
                    <Dropdown options={sortOptions} onSelect={handleSortSelect} defualt={sortOptions.find(opt => opt.value === sortBy)?.label || "مرتب‌سازی"} mobileBehavior="icon" isOpen={activeDropdown === 'sort'} onToggle={() => handleDropdownToggle('sort')}/>
                </div>
            </div>

            {/* جدید: افزودن ref به کانتینر جدول */}
            <div ref={scrollContainerRef} className={style.table}>
                {renderContent()}

                {/* نمایش لودینگ برای صفحات بعدی */}
                {loading && page > 1 && (
                    <div className={style.loadingMore}>
                        <p>در حال بارگذاری موارد بیشتر...</p>
                        <LoadingSpinner />
                    </div>
                )}

                {/* نمایش پیام انتهای لیست */}
                {!hasNextPage && students.length > 0 && !loading && (
                    <div className={style.endOfList}>
                        <p>به انتهای لیست رسیدید.</p>
                    </div>
                )}
            </div>
        </div>
    );
}