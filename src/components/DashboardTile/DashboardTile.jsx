import React, { useState, useEffect } from 'react';
import styles from "./DashboardTile.module.css";
import teacher from "../../assets/icons/teachers.svg";
import kadr from "../../assets/icons/kadr.svg";
import calender from "../../assets/icons/work-list.svg";
import student from "../../assets/icons/student.svg"
import { NavLink } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api, { endpoints } from "../../config/api";

// 1. تابع کمکی برای تبدیل اعداد به فارسی
const toPersianDigits = (num) => {
    // اگر ورودی null یا undefined است، همان را برگردان
    if (num === null || num === undefined) return '';
     
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};


export default function DashboardTile() {
    const [datas, setDatas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            try {
                const response = await api.get(endpoints.dashboard());
                if (response.data && typeof response.data.data === 'object') {
                    setDatas(response.data.data);
                } else {
                    setError("ساختار داده دریافتی از سرور نامعتبر است.");
                }
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
                if (loading) setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 10 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

   

    if (error) {
        return <div>خطا: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.tiles}>
                {/* کاشی دانش‌آموزان */}
                <NavLink to={"/"} className={styles.tile}>
                    <div className={styles.header}>
                        <p className={styles.title}>دانش آموزان</p>
                         <img src={student} alt="Teachers"/>
                    </div>
                    <div className={styles.content}>
                       
                        {!loading && <><h1>{toPersianDigits(datas?.total_students)}</h1>
                        <p className={styles.click}>
                            {toPersianDigits(datas?.absent_students_today)} نفر غایب هستند.
                            
                        </p></>}
                        {loading && <><Skeleton count={1} height={30} style={{ marginTop: '20px' }} /><Skeleton style={{ marginTop: '3vh' }} count={1} width={100} height={15} /></>}
                    </div>
                </NavLink>

                {/* کاشی دبیران */}
                <NavLink to={"/teachers"} className={styles.tile}>
                    <div className={styles.header}>
                        <p className={styles.title}>دبیران</p>
                        <img src={teacher} alt="Teachers"/>
                    </div>
                    <div className={styles.content}>
                        {!loading && <><h1>{toPersianDigits(datas?.total_teachers)}</h1>
                        <p className={styles.click}>
                            {toPersianDigits(datas?.absent_teachers_today)} نفر غایب هستند.
                        </p></>}
                         {loading && <><Skeleton count={1} height={30} style={{ marginTop: '20px' }} /><Skeleton style={{ marginTop: '3vh' }} count={1} width={100} height={15} /></>}
                    </div>
                </NavLink>

                {/* کاشی کادر آموزشگاه */}
                <NavLink to={"/members"} className={styles.tile}>
                    <div className={styles.header}>
                        <p className={styles.title}>کادر آموزشگاه</p>
                        <img src={kadr} alt="Staff"/>
                    </div>
                    <div className={styles.content}>
                        {!loading && <><h1>{toPersianDigits(datas?.total_staff)}</h1>
                        <p className={styles.click}>
                            {toPersianDigits(datas?.absent_staff_today)} نفر غایب هستند.
                        </p></>}
                         {loading && <><Skeleton count={1} height={30} style={{ marginTop: '20px' }} /><Skeleton style={{ marginTop: '3vh' }} count={1} width={100} height={15} /></>}
                    </div>
                </NavLink>

                {/* کاشی برنامه هفتگی */}
                <NavLink to={"/week"} className={styles.tile}>
                    <div className={styles.header}>
                        <p>برنامه هفتگی</p>
                        <img src={calender} alt="Calendar"/>
                    </div>
                    <div className={styles.content}>
                        <p className={`${styles.click} ${styles.in}`}>برای مشاهده ی برنامه ی هفتگی کلیک کنید</p>
                    </div>
                </NavLink>
            </div>
        </div>
    );
}