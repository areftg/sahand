import { useState, useEffect, useRef } from 'react';
import moment from 'jalali-moment';
import styles from "./PLastRecord.module.css";
import sjm_Logo from '../../assets/icons/sjm-logo-pdf.svg';
import right_line from '../../assets/icons/right-line.svg';
import left_line from '../../assets/icons/left-line.svg';
import poet from '../../assets/icons/center-poet.svg';
import logos from '../../assets/icons/th-logos-white.svg';
import api, { endpoints } from '../../config/api';

export default function PLastRecord() {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setStudentData(null);
            try {
                // --- خواندن ID فرزند از Local Storage ---
                const userString = localStorage.getItem('user');
                if (!userString) throw new Error("اطلاعات کاربر در سیستم موجود نیست.");
                
                const userData = JSON.parse(userString);
                const selectedChildId = userData?.selected_child_id; 
                if (!selectedChildId) throw new Error("فرزند انتخاب شده‌ای یافت نشد.");

                // --- محاسبه سال و ماه قبل ---
                const lastMonth = moment().subtract(1, 'jMonth');
                const year = lastMonth.jYear();
                const month = lastMonth.jMonth() + 1;

                // --- ارسال درخواست به API ---
                const params = {
                    academic_year_id: 1,
                    year: year,
                    month: month
                };
                
                const response = await api.get(endpoints.studentrecord(selectedChildId), { params });
                const rawData = response.data.data;

                if (!rawData || !rawData.student) {
                    throw new Error("کارنامه‌ای برای ماه گذشته یافت نشد.");
                }

                // --- آماده‌سازی داده‌ها برای نمایش ---
                const formattedData = {
                    id: rawData.student.id,
                    firstName: rawData.student.profile.first_name,
                    lastName: rawData.student.profile.last_name,
                    avatar: rawData.student.profile.avatar || 'https://via.placeholder.com/100x120.png?text=Student',
                    nationalCode: rawData.student.profile.national_code,
                    fatherName: rawData.student.father_name,
                    field: rawData.student.active_enrollment?.class?.field_of_study?.name || 'نامشخص',
                    major: 'شبکه و نرم افزار رایانه', 
                    academicYear: '۱۴۰۴-۱۴۰۵',
                    average: rawData.average || 0,
                    averageInWords: 'نیاز به پیاده‌سازی دارد',
                    province: 'گیلان',
                    state: 'لنگرود',
                    school: rawData.student.active_enrollment?.class?.school?.name,
                    // 📍 ۱. تغییر اصلی اینجاست
                    scores: rawData.courses?.map(course => {
                        const scoreValue = course.monthly_average;
                        
                        // اگر نمره null یا undefined بود، خط تیره نمایش بده
                        const displayScore = (scoreValue === null || scoreValue === undefined) ? '—' : scoreValue;
                        
                        // وضعیت قبولی هم بر اساس وجود نمره تعیین می‌شود
                        const displayStatus = (scoreValue === null || scoreValue === undefined) ? '—' : (scoreValue >= 10 ? 'قبول است' : 'قبول نیست');

                        return {
                            subject: course.course_name,
                            score: displayScore,
                            isAccepted: displayStatus
                        };
                    }) || [],
                };
                
                setStudentData(formattedData);

            } catch (err) {
                setError(err.message || "خطا در دریافت اطلاعات.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>در حال بارگذاری اطلاعات کارنامه...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>خطا: {error}</div>;
    }

    if (!studentData) {
        return <div>اطلاعاتی برای نمایش وجود ندارد.</div>;
    }

    return (
        <div className={styles.PLastRecord}>
            <h1>کارنامه ماهیانه</h1>
            <div className={styles.Page}>
                <div ref={componentRef} className={styles.reportCardPage}>
                    <header className={styles.reportHeader}>
                        <div className={styles.schoolInfo}>
                            <img src={sjm_Logo} alt="آرم" className={styles.schoolLogo} />
                            <h4>به نــــام خــــداونـــد بـــخــــشــــنـــده</h4>
                            <h6>گزارش ماهیانه وضعیت تحصیلی دانش آموزان</h6>
                            <h3>ارائه شده توسط سامانه جامع مدارس</h3>
                        </div>
                        <div className={styles.studentDetails}>
                            <table><tbody><tr>
                                <td>
                                    <p><span className={styles.label}>نام:</span><span className={styles.value}>{studentData.firstName}</span></p>
                                    <p><span className={styles.label}>نام خانوادگی:</span><span className={styles.value}>{studentData.lastName}</span></p>
                                    <p><span className={styles.label}>کدملی:</span><span className={styles.value}>{studentData.nationalCode}</span></p>
                                    <p><span className={styles.label}>نام پدر:</span><span className={styles.value}>{studentData.fatherName}</span></p>
                                    <p><span className={styles.label}>کد دانش آموز:</span><span className={styles.value}>{studentData.id}</span></p>
                                </td>
                                <td>
                                    <p><span className={styles.label}>استان:</span><span className={styles.value}>{studentData.province}</span></p>
                                    <p><span className={styles.label}>منطقه:</span><span className={styles.value}>{studentData.state}</span></p>
                                    <p><span className={styles.label}>آموزشگاه:</span><span className={styles.value}>{studentData.school}</span></p>
                                    <p><span className={styles.label}>شاخه:</span><span className={styles.value}>{studentData.field}</span></p>
                                    <p><span className={styles.label}>رشته:</span><span className={styles.value}>{studentData.major}</span></p>
                                </td>
                            </tr></tbody></table>
                        </div>
                        <div className={styles.studentPhotoContainer}>
                            <img src={studentData.avatar} alt="عکس دانش‌آموز" className={styles.studentPhoto} />
                        </div>
                    </header>
                    <main className={styles.gradesSection}>
                        <div className={styles.tableContainer}>
                            <table className={styles.gradesTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.tborderright} style={{width:'1%', padding: "15px 0"}}><p>ردیف</p></th>
                                        <th className={styles.tbordercenter} style={{width:'55%'}}>نام درس</th>
                                        <th className={styles.tborderleft} style={{width:'20%'}}>نمره(از 20)</th>
                                        <th className={styles.tborderlefter} style={{widows: '25%'}}>وضعیت قبولی</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.scores?.map((score, i) => (
                                        <tr key={i} className={styles.scorecontainer}>
                                            <td className={styles.borderright} style={{ paddingLeft: 0 }}><div className={styles.content}>{i + 1}</div></td>
                                            <td className={styles.bordercenter}><div className={styles.content}>{score.subject}</div></td>
                                            <td className={styles.borderleft}><div className={styles.content}>{score.score}</div></td>
                                            <td className={styles.borderlefter}><div className={styles.content}>{score.isAccepted}</div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                    <footer className={styles.reportFooter}>
                        <div className={styles.first}><img alt='' src={left_line} className={styles.LL} /><img alt='' src={poet} className={styles.poet} /><img alt='' src={right_line} className={styles.RL} /></div>
                        <div className={styles.second}><p>تمامی حقوق این طرح و نرم افزار سامانه جامع مدارس برای تیم آرکانیکس محفوظ است.</p><img alt='' src={logos} className={styles.logos} /></div>
                    </footer>
                </div>
            </div>
        </div>
    );
}