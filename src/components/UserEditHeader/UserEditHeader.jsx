import React from 'react';
import styles from "./UserEditHeader.module.css";
import userr from "../../assets/icons/name.svg";
import schoolname from "../../assets/icons/schoolname.svg";
import permissiom from "../../assets/icons/permission.svg";
import profile from "../../assets/icons/defaultprofile.svg"
import { useAuth } from '../../Context/AuthContext';

// آبجکت برای ترجمه نقش‌ها به فارسی
const roleTranslations = {
    admin: 'مدیریت کل',
    manager: 'مدیر',
    teacher: 'معلم',
    student: 'دانش‌آموز'
};

export default function EditSchoolHeader({formData,setFormData,message,setMessage}) {
    const { user } = useAuth();

    // --- شروع بخش اصلاح شده ---
    // اگر user.role یک آبجکت بود، نام آن را استخراج می‌کند، در غیر این صورت خود مقدار را استفاده می‌کند
    const roleName = typeof user?.role === 'object' && user?.role !== null
        ? user.role.code
        : user?.role;
    // --- پایان بخش اصلاح شده ---

    return (
        <div className={styles.container}>
            <div className={` ${styles.profile} ${styles.display}`}>
                <img src={profile} alt="" />
            </div>
            <div className={styles.adminname}>
                <div className={styles.header}>
                    <p>نام و نام خانوادگی</p>
                    <img src={userr} alt='' />
                </div>
                <h2>{`${formData.firstName} ${formData.lastName}`}</h2>
            </div>
            <div className={styles.permission}>
                <div className={styles.header}>
                    <p> دسترسی </p>
                    <img src={permissiom} alt='' />
                </div>

                {/* از متغیر roleName که بالاتر تعریف شد استفاده می‌کنیم */}
                <h2>{formData.role}</h2>
            </div>
            <div className={styles.schoolname}>
                <div className={styles.header}>
                    <p>مدرسه</p>
                    <img src={schoolname} alt='' />
                </div>
                <h2>{user?.school}</h2>
            </div>
        </div>
    );
}