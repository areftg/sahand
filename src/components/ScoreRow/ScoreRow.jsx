import style from "./ScoreRow.module.css";
import React, { useState, useEffect, useCallback } from 'react';
import Dropdown from "../DropDown/DropDown";
import { useParams } from 'react-router-dom';
import api, { endpoints } from "../../config/api";

const monthOptions = [
    { value: 1, label: "فروردین" }, { value: 2, label: "اردیبهشت" }, { value: 3, label: "خرداد" },
    { value: 4, label: "تیر" }, { value: 5, label: "مرداد" }, { value: 6, label: "شهریور" },
    { value: 7, label: "مهر" }, { value: 8, label: "آبان" }, { value: 9, label: "آذر" },
    { value: 10, label: "دی" }, { value: 11, label: "بهمن" }, { value: 12, label: "اسفند" },
];

const sortOptions = [
    { value: "latest", label: "جدیدترین‌ها" },
    { value: "oldest", label: "قدیمی‌ترین‌ها" },
    { value: "highest", label: "بیشترین نمره" },
    { value: "lowest", label: "کمترین نمره" },
];

export default function ScoreRow() {
    const { studentId } = useParams();
    const [scores, setScores] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().toLocaleDateString('fa-IR', { year: 'numeric' }).replace(/[^0-9]/g, ''));
    const [classOptions, setClassOptions] = useState([]);

    // --- تغییر ۱: State ها فقط مقدار (value) را نگه می‌دارند ---
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [sortByValue, setSortByValue] = useState('latest');

    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };

    // --- تغییر ۲: توابع Select فقط مقدار را در state ذخیره می‌کنند ---
    const handleMonthSelect = (option) => {
        setSelectedMonth(option.value);
        setActiveDropdown(null);
    };

    const handleClassSelect = (option) => {
        setSelectedClassId(option.value);
        setActiveDropdown(null);
    };

    const handleSortSelect = (option) => {
        setSortByValue(option.value);
        setActiveDropdown(null);
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get(endpoints.classes());
                const formattedClasses = (response.data.data || []).map(cls => ({ value: cls.id, label: cls.name }));
                setClassOptions([{ value: 'all', label: 'تمامی کلاس ها' }, ...formattedClasses]);
            } catch (err) {
                console.error("خطا در دریافت لیست کلاس‌ها:", err);
            }
        };
        fetchClasses();
    }, []);

    // --- تغییر ۳: تابع fetch از state های جدید (که فقط مقدار هستند) استفاده می‌کند ---
    const fetchScoreData = useCallback(async () => {
        if (!studentId || !selectedMonth) {
            setScores([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                month: selectedMonth,
                year: selectedYear,
                sort: sortByValue, // استفاده مستقیم از مقدار
            });

            if (selectedClassId !== 'all') {
                params.append('class_id', selectedClassId); // استفاده مستقیم از مقدار
            }

            const response = await api.get(`${endpoints.studentscore(studentId)}?${params.toString()}`);
            setScores(response.data.data || []);
        } catch (err) {
            setError("متاسفانه در بارگذاری اطلاعات مشکلی پیش آمد.");
            setScores([]);
        } finally {
            setLoading(false);
        }
    }, [studentId, selectedMonth, selectedYear, selectedClassId, sortByValue]);

    useEffect(() => {
        fetchScoreData();
    }, [fetchScoreData]);

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.right}>
                    <svg width="38" height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* ... path ... */}
                    </svg>
                    <h1>لیست سوابق نمرات</h1>
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
                    <div className={`${style.filter} ${style.display}`}>
                        {/* --- تغییر ۴: defualt ها برای پیدا کردن لیبل از روی مقدار آپدیت شدند --- */}
                        <Dropdown
                            options={classOptions}
                            defualt={classOptions.find(c => c.value === selectedClassId)?.label || 'تمامی کلاس ها'}
                            onSelect={handleClassSelect}
                            isOpen={activeDropdown === 'class'}
                            onToggle={() => handleDropdownToggle('class')}
                        />
                    </div>
                    <div className={style.filter}>
                        <Dropdown
                            options={sortOptions}
                            defualt={sortOptions.find(s => s.value === sortByValue)?.label || 'جدیدترین‌ها'}
                            onSelect={handleSortSelect}
                            isOpen={activeDropdown === 'sort'}
                            onToggle={() => handleDropdownToggle('sort')}
                        />
                    </div>
                </div>
            </div>
            <div className={style.table}>
                {!selectedMonth ? (
                    <p>لطفا برای نمایش نمرات، ماه مورد نظر را انتخاب کنید.</p>
                ) : loading ? (
                    <p>در حال بارگذاری نمرات...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : scores.length > 0 ? (
                    scores.map((item, index) => (
                        <div className={style.row} key={item.id || index}>
                            <div className={style.item}>{item.date}</div>
                            <div className={style.item}>
                                <p className={style.placeholder}>{item.type || 'نمره'}:</p>
                                <div className={style.score}>
                                    <p>{item.score}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>نمره‌ای برای ماه انتخاب شده یافت نشد.</p>
                )}
            </div>
        </div>
    );
}