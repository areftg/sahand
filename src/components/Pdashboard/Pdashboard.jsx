import React, { useState, useEffect } from 'react'; // 📍 ۱. وارد کردن هوک‌ها
import style from "./Pdashboard.module.css";
import LastScore from "../../assets/icons/LastScore.svg";
import Subtract from "../../assets/icons/Subtract.svg";
import AbsenceIcon from "../../assets/icons/Subtract.svg";
import morkhasi from "../../assets/icons/Morkhasi.svg";
import Call from "../../assets/icons/Call.svg";
import { NavLink } from "react-router-dom";

export default function Pdashboard() {
    // 📍 ۲. State برای نگهداری نام دانش‌آموز
    const [studentName, setStudentName] = useState('');

    // 📍 ۳. useEffect برای خواندن نام از Local Storage در زمان لود شدن
    useEffect(() => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userData = JSON.parse(userString);
                // ❗️ مسیر صحیح به پروفایل فرزند را بر اساس ساختار Local Storage خود چک کنید
                const profile = userData?.selected_child?.profile;
                if (profile && profile.first_name && profile.last_name) {
                    setStudentName(`${profile.first_name} ${profile.last_name}`);
                }
            }
        } catch (error) {
            console.error("خطا در خواندن اطلاعات دانش‌آموز از Local Storage:", error);
            // در صورت بروز خطا، یک نام پیش‌فرض نمایش می‌دهیم
            setStudentName("فرزند شما");
        }
    }, []); // [] یعنی این افکت فقط یک بار اجرا می‌شود

    return (
        <div className={style.container}>
            {/* 📍 ۴. نمایش نام دانش‌آموز به صورت داینامیک */}
            <h1 className={style.title}>
                اولیاء گرامی {studentName ? `${studentName}،` : ''}
                <br/> به سامانه سهند <span>(ویژه والدین)</span> خوش آمدید
            </h1>
            <p className={style.description}>برای ادامه یکی از موارد زیر را انتخاب کنید.</p>
            
            {/* لینک‌ها بدون تغییر باقی می‌مانند */}
            <NavLink className={style.button} to={"/Parent/Dashboard"}>
                <img src={LastScore} alt="" />
                <p>مشاهده آخرین کارنامه</p>
            </NavLink>
            <NavLink className={style.button} to={"/Parent/Dashboard/PAbsenceList"}>
                <img src={Subtract} alt="" />
                <p>مشاهده فهرست غیبت ها</p>
            </NavLink>
            <NavLink className={style.button} to={"/Parent/Dashboard/PAbsenceGraph"}>
                <img src={AbsenceIcon} alt="" />
                <p>مشاهده نمودار غیبت ها</p>
            </NavLink>
            <NavLink className={style.button} to={"/Parent/Dashboard/PLeave"}>
                <img src={morkhasi} alt="" />
                <p>درخواست مرخصی</p>
            </NavLink>
            <NavLink className={style.button} to={"/Parent/Dashboard/PCallSchool"}>
                <img src={Call} alt="" />
                <p>اطلاعات تماس مدرسه</p>
            </NavLink>
        </div>
    );
}