import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import styles from "./Recordpdf.module.css";
import allah from "../../assets/icons/allah.svg";
import api, { endpoints } from '../../config/api';
import logos from "../../assets/icons/logos.svg"

export default function Recordpdf({ studentId, year, month, academicYearId, classId, firstName, lastName, nationalCode, onClose }) {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `کارنامه-${firstName}-${lastName}` || 'کارنامه',
        onAfterPrint: () => onClose(),
    });

    useEffect(() => {
        if (!studentId || !year || !month || !academicYearId || !classId) {
            setError("اطلاعات ورودی (شامل کلاس) برای نمایش کارنامه ناقص است.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setStudentData(null);

            try {
                const studentParams = { academic_year_id: academicYearId, year, month };

                const [studentResponse, coursesResponse] = await Promise.all([
                    api.get(endpoints.studentrecord(studentId), { params: studentParams }),
                    api.get(endpoints.courses(classId))
                ]);

                const rawData = studentResponse.data.data;
                const allCourses = coursesResponse.data.data || [];

                if (!rawData || !rawData.student) {
                    throw new Error("اطلاعاتی برای این دانش‌آموز در تاریخ انتخابی یافت نشد.");
                }

                const studentScores = rawData.courses || [];
                const mergedScores = allCourses.map(course => {
                    const studentScore = studentScores.find(score => score.course_name === course.name);
                    return {
                        subject: course.name,
                        value: studentScore ? studentScore.monthly_average : '---'
                    };
                });

                const formattedData = {
                    firstName: firstName ? decodeURIComponent(firstName) : '',
                    lastName: lastName ? decodeURIComponent(lastName) : '',
                    nid: nationalCode || '',
                    fatherName: rawData?.student?.father_name,
                    id: rawData?.student?.id,
                    avatar: rawData?.student?.profile?.avatar || null,
                    school: rawData?.student?.active_enrollment?.class?.school?.name,
                    grade: rawData?.student?.active_enrollment?.class?.name,
                    field: rawData?.student?.active_enrollment?.class?.field_of_study?.name || 'نامشخص',
                    province: 'گیلان',
                    state: 'لنگرود',
                    reportDate: `${year}/${String(month).padStart(2, '0')}`,
                    scores: mergedScores,
                    average: (() => {
                        const validScores = studentScores.map(c => c.monthly_average).filter(v => typeof v === 'number');
                        if (validScores.length === 0) return 0;
                        const sum = validScores.reduce((a, b) => a + b, 0);
                        return (sum / validScores.length).toFixed(2);
                    })(),
                    averageInWords: 'نیاز به پیاده‌سازی دارد',
                };

                setStudentData(formattedData);

            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || "خطا در پردازش اطلاعات.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId, year, month, academicYearId, classId, firstName, lastName, nationalCode]);

    useEffect(() => {
        if (studentData && !loading) {
            handlePrint();
        }
    }, [studentData, loading, handlePrint]);

    if (loading) {
        return <div className={styles.statusContainer}>در حال بارگذاری اطلاعات کارنامه...</div>;
    }
    if (error) {
        return <div className={styles.statusContainer} style={{ color: 'red' }}>خطا: {error}</div>;
    }
    return (
        <div>
            <div className={styles.Page} ref={componentRef}>
                {studentData && (
                    <div className={styles.reportCardPage}>
                        <header className={styles.reportHeader}>
                            <div className={styles.schoolInfo}>
                                <img src={allah} alt="آرم" className={styles.schoolLogo} />
                                <h4>وزارت آموزش و پرورش</h4>
                                <h4>اداره‌ی کل آموزش و پرورش استان گیلان</h4>
                                <h4>اداره‌ی آموزش و پرورش شهرستان لنگرود</h4>
                                <h3>ارائه شده توسط سامانه‌ی جامع مدارس</h3>
                            </div>

                            <div className={styles.studentDetails}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p>نام: <strong>{studentData.firstName}</strong></p>
                                                <p>نام‌خانوادگی: <strong>{studentData.lastName}</strong></p>
                                                <p>کدملی: <strong>{studentData.nid}</strong></p>
                                                <p>نام پدر: <strong>{studentData.fatherName}</strong></p>
                                                <p>کد دانش‌آموز: <strong>{studentData.id}</strong></p>
                                                <p>تاریخ گزارش: <strong>{studentData.reportDate}</strong></p>
                                            </td>
                                            <td>
                                                <p>استان: <strong>{studentData.province}</strong></p>
                                                <p>منطقه: <strong>{studentData.state}</strong></p>
                                                <p>آموزشگاه: <strong>{studentData.school}</strong></p>
                                                <p>پایه: <strong>{studentData.grade}</strong></p>
                                                <p>شاخه: <strong>{studentData.grade}</strong></p>
                                                <p>رشته تحصیلی: <strong>{studentData.field}</strong></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.studentPhotoContainer}>
                                {studentData.avatar ? <img src={studentData.avatar} alt="عکس دانش‌آموز" className={styles.studentPhoto} /> : <div className={styles.noPhoto}>محل عکس</div>}
                            </div>
                        </header>
                        <main className={styles.gradesSection}>
                            <div className={styles.tableContainer}>
                                <table className={styles.gradesTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.tborderright} style={{ width: '5%' }}>ردیف</th>
                                            <th className={styles.tbordercenter} style={{ width: '45%' }}>نام درس</th>
                                            <th className={styles.tborderleft} style={{ width: '45%' }}>نمره</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 22 }).map((_, i) => {
                                            const score = studentData.scores[i];
                                            return (
                                                <tr key={i} className={styles.scorecontainer}>
                                                    <td className={styles.borderright}>{score ? i + 1 : <span>&nbsp;</span>}</td>
                                                    <td className={styles.bordercenter}>{score ? score.subject : <span>&nbsp;</span>}</td>
                                                    <td className={styles.borderleft}>{score ? score.value : <span>&nbsp;</span>}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </main>

                        <footer className={styles.reportFooter}>
                            <div className={styles.left}>
                                <div className={styles.leftjust}>
                                    <p>معدل:</p>
                                    <div className={styles.score}>{studentData.average}</div>
                                    <p>معدل به حروف:</p>
                                    <div className={styles.charscore}>{studentData.averageInWords}</div>
                                </div>
                                <div className={styles.managersign}>
                                    <div className={styles.paragraph}>
                                        <p>مدیر آموزشگاه / مدیر مجتمع:</p>
                                        <p>امضا</p>
                                    </div>
                                    <span>محل درج مهر آموزشگاه</span>
                                </div>
                            </div>
                            
                            <div className={styles.right} >
                                <img src={logos} alt="" />
                            </div>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
}