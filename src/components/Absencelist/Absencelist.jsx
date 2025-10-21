import React, { useState, useEffect } from 'react';
import style from "./Absencelist.module.css"
import { useParams, useOutletContext } from 'react-router-dom';
import Dropdown from "../DropDown/DropDown"; // ایمپورت کردن کامپوننت دراپ‌دون
import api, { endpoints } from "../../config/api";

export default function ScoreRow() { 
    const { studentId } = useParams();
    const [absenceData, setAbsenceData] = useState([]);
    const { studata } = useOutletContext();
    
    // گرفتن سال شمسی فعلی (اصلاح شد)
    const currentPersianYear = new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[0];

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(1); // ماه پیش‌فرض

    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };

    const handleMonthSelect = (option) => {
        setSelectedMonth(option.value);
        setActiveDropdown(null); // بستن دراپ‌دون پس از انتخاب
    };

    useEffect(() => {
        const fetchAbsenceData = async () => {
            if (studata && studata.active_enrollment) {
                try {
                    const response = await api.get(endpoints.absencelist(studata.active_enrollment.id), {
                        params: {
                            year: parseInt(currentPersianYear),
                            month: selectedMonth
                        }
                    });

                    // --- تغییر ۱: پردازش و گروه‌بندی اطلاعات متناسب با پاسخ سرور ---
                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        const rawData = response.data.data;

                        // گروه‌بندی غیبت‌ها بر اساس تاریخ برای نمایش در یک سطر
                        const groupedData = Object.values(rawData.reduce((acc, current) => {
                            if (!acc[current.date]) {
                                acc[current.date] = {
                                    date: current.date,
                                    day_of_week: current.day_of_week,
                                    status_fa: current.status_fa, 
                                    course: current.course,
                                    times: [] 
                                };
                            }
                            acc[current.date].times.push(current.time_slot);
                            return acc;
                        }, {}));
                        
                        setAbsenceData(groupedData);
                    } else {
                        setAbsenceData([]);
                    }
                } catch (error) {
                    console.error("Error fetching absence data:", error);
                    setAbsenceData([]);
                }
            }
        };

        fetchAbsenceData();
    }, [studata, selectedMonth, currentPersianYear]);

    const monthOptions = [
        { value: 1, label: "فروردین" }, { value: 2, label: "اردیبهشت" }, { value: 3, label: "خرداد" },
        { value: 4, label: "تیر" }, { value: 5, label: "مرداد" }, { value: 6, label: "شهریور" },
        { value: 7, label: "مهر" }, { value: 8, label: "آبان" }, { value: 9, label: "آذر" },
        { value: 10, label: "دی" }, { value: 11, label: "بهمن" }, { value: 12, label: "اسفند" },
    ];
    
    // --- تغییر ۲: به‌روزرسانی کامپوننت Row برای نمایش اطلاعات کامل‌تر ---
    const Row = ({ date, day_of_week, status_fa, course, times }) => {
        const formatTimes = (timesArray) => {
            if (!timesArray || timesArray.length === 0) return "-";
            // آرایه زنگ‌ها را به یک رشته متنی تبدیل می‌کند
            return timesArray.join(' - ');
        };

        return (
            <div className={style.row}>
                <div className={style.item}>{`${date} (${day_of_week})`}</div>
            
                <div className={style.item}>{formatTimes(times)}</div>
            </div>
        );
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.right}>
                    <svg width="38" height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.46033 0.160156C2.15626 0.160156 0.28125 2.03517 0.28125 4.33924V31.2711C0.28125 33.5751 2.15626 35.4502 4.46033 35.4502H8.47253C7.42776 34.3645 6.78204 32.8926 6.78204 31.2711V4.33924C6.78204 2.71775 7.42776 1.24579 8.47253 0.160156H4.46033ZM12.8185 0.160156C10.5144 0.160156 8.63941 2.03517 8.63941 4.33924V31.2711C8.63941 33.5751 10.5144 35.4502 12.8185 35.4502H33.2495C35.5536 35.4502 37.4286 33.5751 37.4286 31.2711V14.0904H27.6774C25.3734 14.0904 23.4984 12.2154 23.4984 9.91134V0.160156H12.8185ZM26.2844 0.976383V9.91134C26.2844 10.6794 26.9094 11.3044 27.6774 11.3044H36.6124L26.2844 0.976383ZM24.8914 17.8052H30.4635C31.2324 17.8052 31.8565 18.4292 31.8565 19.1982V24.7703C31.8565 25.5392 31.2324 26.1633 30.4635 26.1633C29.6945 26.1633 29.0705 25.5392 29.0705 24.7703V22.561L24.0189 27.6126C23.7468 27.8856 23.3906 28.0207 23.034 28.0207C22.6774 28.0207 22.3212 27.8847 22.0491 27.6126L19.3193 24.8827L16.5895 27.6126C16.0452 28.1568 15.1638 28.1568 14.6196 27.6126C14.0754 27.0684 14.0754 26.187 14.6196 25.6427L18.3344 21.928C18.8786 21.3838 19.76 21.3838 20.3042 21.928L23.034 24.6578L27.1006 20.5912H24.8914C24.1224 20.5912 23.4984 19.9671 23.4984 19.1982C23.4984 18.4292 24.1224 17.8052 24.8914 17.8052Z" fill="white"/>
                    </svg>
                    <h1>تاریخچه غیبت ثبت شده توسط ما</h1>
                </div>
                <div className={style.left}>
                    <div className={style.filter}>
                        <Dropdown
                            options={monthOptions}
                            defualt={monthOptions.find(m => m.value === selectedMonth)?.label || "ماه را انتخاب کنید"}
                            onSelect={handleMonthSelect}
                            isOpen={activeDropdown === 'month'}
                            onToggle={() => handleDropdownToggle('month')}
                        />
                    </div>
                </div>
            </div>
            <div className={style.table}>
                

                {absenceData && absenceData.length > 0 ? (
                    absenceData.map((absence, index) => (
                        <Row 
                            key={index} 
                            date={absence.date} 
                            day_of_week={absence.day_of_week}
                            status_fa={absence.status_fa}
                            course={absence.course}
                            times={absence.times} 
                        />
                    ))
                ) : (
                    <p style={{textAlign: "center", padding: "20px"}}>هیچ غیبتی برای این ماه ثبت نشده است.</p>
                )}
            </div>
        </div>
    )
}