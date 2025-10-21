
import { useState, useEffect } from 'react';
import style from "./PCallSchool.module.css";

export default function PCallSchool() {
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const userString = localStorage.getItem('user');
            if (!userString) {
                throw new Error("اطلاعات کاربر در سیستم یافت نشد.");
            }
            const userData = JSON.parse(userString);
            
            const schoolData = userData?.selected_child?.active_enrollment?.class?.school;

            if (!schoolData) {
                throw new Error("اطلاعات مدرسه برای فرزند انتخابی یافت نشد.");
            }
            
            setSchoolInfo(schoolData);

        } catch (err) {
            setError(err.message || "خطا در خواندن اطلاعات از حافظه سیستم.");
            console.error("Error reading from local storage:", err);
        }
    }, []);

    if (error) {
        return (
            <div className={`${style.PCallSchool} ${style.errorState}`}>
                <h1>خطا</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!schoolInfo) {
        return <div className={style.PCallSchool}><h1>در حال بارگذاری اطلاعات تماس...</h1></div>;
    }

    return (
        <div className={style.PCallSchool}>
            <h1>اطلاعات تماس آموزشگاه <br/> {schoolInfo.name}</h1>
            <div className={style.content}>
                <div className={style.column}>
                    
                    {/* 📍 ۱. ردیف‌ها همیشه نمایش داده می‌شوند */}
                    {/* محتوای داخل آن‌ها بر اساس وجود داده تغییر می‌کند */}

                    <div className={style.row}>
                        <p className={style.displaynone}>۱شماره تماس:</p>
                        <div className={style.textbox}>
                            {schoolInfo.phone_number_1 || 'وجود ندارد'}
                        </div>
                        {/* دکمه فقط در صورت وجود شماره فعال است */}
                        <a href={schoolInfo.phone_number_1 ? `tel:${schoolInfo.phone_number_1}` : undefined}>
                            <button disabled={!schoolInfo.phone_number_1}>تماس</button>
                        </a>
                    </div>

                    <div className={style.row}>
                        <p className={style.displaynone}>۲شماره تماس:</p>
                        <div className={style.textbox}>
                            {schoolInfo.phone_number_2 || 'وجود ندارد'}
                        </div>
                        <a href={schoolInfo.phone_number_2 ? `tel:${schoolInfo.phone_number_2}` : undefined}>
                            <button disabled={!schoolInfo.phone_number_2}>تماس</button>
                        </a>
                    </div>

                    <div className={style.row}>
                        <p className={style.displaynone}>۳شماره تماس:</p>
                        <div className={style.textbox}>
                            {schoolInfo.phone_number_3 || 'وجود ندارد'}
                        </div>
                        <a href={schoolInfo.phone_number_3 ? `tel:${schoolInfo.phone_number_3}` : undefined}>
                            <button disabled={!schoolInfo.phone_number_3}>تماس</button>
                        </a>
                    </div>
                    
                    <div className={style.row}>
                        <p className={style.displaynone}>ایمیل:</p>
                        <div className={style.textbox2}>
                            {schoolInfo.email || 'وجود ندارد'}
                        </div>
                        <a href={schoolInfo.email ? `mailto:${schoolInfo.email}` : undefined}>
                            <button disabled={!schoolInfo.email}>ایمیل</button>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}