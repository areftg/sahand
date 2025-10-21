// فایل pages/RecordPage/RecordPage.js

import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// مسیر کامپوننت‌های خود را با دقت وارد کنید
import RecordPDF from '../../components/Recordpdf/Recordpdf'; 
import WeeklyReporPDF from '../../components/WeeklyReporPDF/WeeklyReporPDF';

export default function RecordPage() {
    const { studentId } = useParams();
    const [searchParams] = useSearchParams();

    // تمام پارامترهای ممکن را از URL می‌خوانیم
    const reportType = searchParams.get('type');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const classId = searchParams.get('classId');
    const academicYearId = searchParams.get('academicYearId');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const nationalCode = searchParams.get('nationalCode');

    // شرط برای نمایش کامپوننت مناسب
    if (reportType === 'detailed_transcript') {
        // اگر "ریز نمرات" خواسته شده بود، این کامپوننت را با پراپ‌های لازم رندر کن
        return <WeeklyReporPDF 
            studentId={studentId} 
            year={year} 
            month={month}
            firstName={firstName}
            lastName={lastName}
            nationalCode={nationalCode}
        />;
    } else {
        // در غیر این صورت (برای "نمره ماهیانه")، این کامپوننت را با پراپ‌های لازم رندر کن
        return (
            <RecordPDF
                studentId={studentId}
                year={year}
                month={month}
                classId={classId}
                academicYearId={academicYearId}
                firstName={firstName}
                lastName={lastName}
                nationalCode={nationalCode}
            />
        );
    }
}