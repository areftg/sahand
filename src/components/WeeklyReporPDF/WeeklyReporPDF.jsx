import React, { useState, useEffect, useMemo } from 'react';
import api, { endpoints } from '../../config/api';
import styles from './WeeklyReporPDF.module.css';
import sjm_Logo from '../../assets/icons/sjm-logo-pdf.svg';
import logos from '../../assets/icons/th-logos.svg';

export default function WeeklyReporPDF({ studentId, year, month, firstName, lastName, nationalCode }) {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!studentId || !year || !month) {
            setError("اطلاعات ورودی شامل دانش‌آموز، سال یا ماه ناقص است.");
            setLoading(false);
            return;
        }

        const fetchReportData = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${endpoints.studentallrecord(studentId)}?year=${year}&month=${month}`;
                const response = await api.get(url);
                console.log("مسی",response);
                
                setReportData(response.data.data);
            } catch (err) {
                console.error("خطا در دریافت اطلاعات کارنامه:", err);
                setError("متاسفانه در دریافت اطلاعات مشکلی پیش آمد.");
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [studentId, year, month]);

    const groupedScores = useMemo(() => {
        if (!reportData?.transcript) return [];
        
        const grouped = reportData.transcript.reduce((acc, record) => {
            if (!acc[record.course_name]) {
                acc[record.course_name] = {
                    subject: record.course_name,
                    records: []
                };
            }
            acc[record.course_name].records.push({
                date: record.activity_date || '',
                type: record.activity_title,
                score: `${record.points_earned} از ${record.max_points}`
            });
            return acc;
        }, {});

        return Object.values(grouped);
    }, [reportData]);

    function toPersianNumber(n) {
        if (n === null || n === undefined) return '۰';
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return n.toString().replace(/\d/g, (d) => persianDigits[d]);
    }

    if (loading) {
        return <div className={styles.statusMessage}>در حال بارگذاری کارنامه...</div>;
    }

    if (error) {
        return <div className={styles.statusMessage} style={{ color: 'red', fontFamily: "bold" }}>{error}</div>;
    }

    if (!reportData) {
        return <div className={styles.statusMessage}>اطلاعاتی برای نمایش وجود ندارد.</div>;
    }

    return (
        <div className={styles.Page}>
            <div className={styles.reportCardPage}>
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
                            <p><span className={styles.label}>نام:</span><span className={styles.value}>{firstName || ''}</span></p>
                            <p><span className={styles.label}>نام خانوادگی:</span><span className={styles.value}>{lastName || ''}</span></p>
                            <p><span className={styles.label}>کدملی:</span><span className={styles.value}>{toPersianNumber(nationalCode)}</span></p>
                        </td>
                        <td>
                            <p><span className={styles.label}>سال تحصیلی:</span><span className={styles.value}>{toPersianNumber(year)}</span></p>
                            <p><span className={styles.label}>ماه:</span><span className={styles.value}>{toPersianNumber(month)}</span></p>
                        </td>
                        </tr></tbody></table>
                    </div>

                    <div className={styles.studentPhotoContainer}>
                        {/* <img src={reportData.avatar} alt="عکس دانش‌آموز" className={styles.studentPhoto} /> */}
                    </div>
                </header>

                <p className={styles.title}>گزارش ماهیانه ریز نمرات ثبت شده توسط دبیران</p>

                <main className={styles.gradesSection}>
                    <div className={styles.tableContainer}>
                        <table className={styles.gradesTable}>
                        <thead>
                            <tr>
                                <th className={styles.tborderright} style={{width:'1%', padding: "15px 0"}}><p>ردیف</p></th>
                                <th className={styles.tbordercenter} style={{width:'45%'}}>نام درس</th>
                                <th className={styles.tborderleft} style={{width:'45%'}}>تاریخچه نمرات ثبت شده</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedScores.map((scoreGroup, i) => (
                            <tr key={i} className={styles.scorecontainer}>
                                <td className={styles.borderright}><p>{toPersianNumber(i + 1)}</p></td>
                                <td className={styles.bordercenter}>{scoreGroup.subject}</td>
                                <td className={styles.borderleft} style={{ padding: 0 }}>
                                    <div className={styles.recordsContainer}>
                                    {scoreGroup.records.map((rec, idx) => (
                                        <div key={idx} className={styles.recordBox}>
                                            <p>{toPersianNumber(rec.date)}</p>
                                            <p>{rec.type}:</p>
                                            <p className={styles.scoreValue}>{toPersianNumber(rec.score)}</p>
                                        </div>
                                    ))}
                                    </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </main>

                <footer className={styles.reportFooter}>
                    <p>
                        <svg viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.9215 0.0178223C16.5714 0.0178223 16.2007 0.0727401 15.8781 0.237494L1.26995 11.8252C0.569745 12.4842 0.00683594 13.0059 0.00683594 13.8571C0.00683594 14.7084 0.480502 15.1958 1.26995 15.8891L15.8781 27.4768C16.5852 27.8337 17.457 27.7788 18.1297 27.3669C18.8093 26.9619 19.2281 26.2274 19.2281 25.4448V18.9645L29.9371 27.4768C30.6441 27.8337 31.516 27.7788 32.1887 27.3669C32.8683 26.9619 33.2871 26.2274 33.2871 25.4448V2.26946C33.2871 1.49374 32.8683 0.759214 32.1887 0.34733C31.8249 0.127658 31.3993 0.0178223 30.9805 0.0178223C30.6304 0.0178223 30.2597 0.0727401 29.9371 0.237494L19.2281 8.74977V2.26946C19.2281 1.49374 18.8093 0.759214 18.1297 0.34733C17.7659 0.127658 17.3403 0.0178223 16.9215 0.0178223Z" fill="black"/>
                        </svg>
                        ادامه در صفحه بعد
                    </p>
                    <img alt='' src={logos} />
                    <p>تمامی حقوق این طرح و نرم افزار سامانه جامع مدارس برای تیم آرکانیکس محفوظ است.</p>
                </footer>
            </div>
        </div>
    )
}