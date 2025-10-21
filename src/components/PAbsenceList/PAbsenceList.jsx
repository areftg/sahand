import React, { useState, useEffect } from 'react';
import moment from 'jalali-moment'; // 📍 ۱. کتابخانه تاریخ شمسی را وارد می‌کنیم
import style from "./PAbsenceList.module.css";
import AbsenceIcon from "../../assets/icons/Subtract.svg";
import api, { endpoints } from "../../config/api";

export default function PAbsencelist() {
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAbsences = async () => {
            try {
                const userString = localStorage.getItem('user');
                if (!userString) {
                    throw new Error("اطلاعات کاربر در سیستم یافت نشد.");
                }
                const userData = JSON.parse(userString);
                const stuid = userData?.selected_child_id;
                if (!stuid) {
                    throw new Error("فرزند انتخاب شده‌ای یافت نشد.");
                }

                // 📍 ۲. محاسبه سال و ماه فعلی شمسی
                const now = moment();
                const year = now.jYear();
                const month = now.jMonth() + 1; // jMonth از 0 شروع می‌شود، پس 1 را اضافه می‌کنیم

                // 📍 ۳. ساخت آبجکت پارامترها برای ارسال به API
                const params = {
                    year: year,
                    month: month
                };

                // 📍 ۴. ارسال درخواست به همراه پارامترهای سال و ماه
                const response = await api.get(endpoints.getPabcence(stuid), { params });
                
                const rawAbsences = response.data.data || [];
                const formattedAbsences = rawAbsences.map(item => ({
                    date: item.date,
                    times: Array.isArray(item.sessions) ? item.sessions.join(' - ') : 'جلسات نامشخص'
                }));

                setAbsences(formattedAbsences);

            } catch (err) {
                console.error("Error fetching attendance data:", err);
                setError(err.message || "خطا در دریافت اطلاعات غیبت‌ها.");
            } finally {
                setLoading(false);
            }
        };

        fetchAbsences();
    }, []);

    const Row = ({ date, times }) => {
        return (
            <div className={style.row}>
                <div className={style.item}>{date}</div>
                <div className={style.item}>
                    <p>{times}</p>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <p>در حال بارگذاری سابقه غیبت...</p>;
        }
        if (error) {
            return <p style={{ color: 'red' }}>خطا: {error}</p>;
        }
        if (absences.length === 0) {
            return <p>هیچ غیبتی برای فرزند شما در این ماه ثبت نشده است.</p>;
        }
        return absences.map((absence, index) => (
            <Row key={index} date={absence.date} times={absence.times} />
        ));
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.right}>
                    <img src={AbsenceIcon} alt="" />
                    <h1>سابقه غیبت های ثبت شده فرزند شما</h1>
                </div>
            </div>
            <div className={style.table}>
                {renderContent()}
            </div>
        </div>
    );
}