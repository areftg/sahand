import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './DocPrint.module.css';
import api, { endpoints } from "../../config/api.js";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx';
import { useNavigate } from "react-router-dom";



export default function DocPrint() {
  const { docid } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    const navigate = useNavigate();

  useEffect(() => {
    const fetchDocumentData = async () => {
      if (!docid) {
        setError("شناسه سند مشخص نشده است.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`${endpoints.docs}/${docid}`);
        // بر اساس ساختار داده شما، اطلاعات اصلی داخل یک آبجکت data قرار دارد
        setDocData(response.data.data); 
        setError(null);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("خطا در دریافت اطلاعات سند.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [docid]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className={styles.printPreviewBackground}>
        <LoadingSpinner/>
        <div>در حال بارگذاری اطلاعات سند...</div>
    </div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!docData) {
    return <div>اطلاعات سند یافت نشد.</div>;
  }

  // تابع کمکی برای فرمت‌دهی اعداد
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === 0) return '';
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  // تابع کمکی برای فرمت‌دهی تاریخ از "14040604" به "1404/06/04"
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return dateString;
    return `${dateString.substring(0, 4)}/${dateString.substring(4, 6)}/${dateString.substring(6, 8)}`;
  };

  return (
    <div className={styles.printPreviewBackground}>
      <div  className={`${styles.printButtoncont} no-print`}>
          <button onClick={handlePrint} className={`${styles.printButton} no-print`}>
        چاپ سند
      </button>
       <button onClick={()=>{navigate(-1)}}  className={`${styles.printButton} no-print`}>
        برگشت 
      </button>
      </div>

      <div className={`${styles.reportCardPage} printableArea`}>
        <div>
          <div className={styles.topInfo}>
            {/* به‌روزرسانی فیلدها بر اساس ساختار جدید */}
            <div>شماره سند: {docData.DocNo}</div>
            {/* در ساختار جدید شماره ردیف روزنامه وجود ندارد، از ID سند استفاده می‌کنیم */}
            <div>شناسه یکتا: {docData.id}</div>
          </div>
          <div className={styles.topInfo}>
            <div>تاریخ: {formatDate(docData.IssueDate)}</div>
            <div>پیوست: {docData.Attachment || ''}</div>
          </div>
          <div className={styles.title}>
            سند حسابداری
            <br />
            {docData.Title}
          </div>
          <table>
            <tbody>
              <tr>
                <th className={styles.w8}>ردیف</th>
                <th className={styles.w12}>کد حساب</th>
                <th className={styles.w40}>شرح</th>
                <th className={styles.w15}>مبلغ جزء</th>
                <th className={styles.w12}>بدهکار</th>
                <th className={styles.w12}>بستانکار</th>
              </tr>

              {/* پیمایش روی آرایه docRows */}
              {docData.docRows && docData.docRows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{row.account?.code}</td>
                    {/* استایل بر اساس بستانکار بودن ردیف */}
                    <td className={row.Creditor > 0 ? styles.left : ''}>{row.AccountTitle}</td>
                    <td />
                    <td>{formatNumber(row.Debtor)}</td>
                    <td>{formatNumber(row.Creditor)}</td>
                  </tr>
                  {/* پیمایش روی جزئیات هر ردیف (DocRowDetails) */}
                  {row.DocRowDetails && row.DocRowDetails.map((detail) => (
                    <tr key={detail.id} className={row.Creditor > 0 ? styles.padding : ''}>
                      <td>{row.Creditor > 0 ? (index + 1) : ''}</td>
                      <td />
                      <td>{detail.Title}</td>
                      <td>{formatNumber(detail.amount)}</td>
                      <td />
                      <td />
                    </tr>
                  ))}
                
                </React.Fragment>
              ))}

            
              <tr>
                  <td></td>
                  <td></td>
                  <td>{docData.Title}</td>
                  <td></td>
                  <td></td>
                  <td></td>
              </tr>
              

              <tr>
                <td colSpan={3} className={styles.noBorder} />
                <td className={styles.allAmount}><strong>جمع کل</strong></td>
                <td>{formatNumber(docData.debtorSum)}</td>
                <td>{formatNumber(docData.creditorSum)}</td>
              </tr>
            </tbody>
          </table>
          <p className={`${styles.footerText} ${styles.left}`}>مبالغ به ریال می‌باشد</p>
          <p className={styles.footerText}>
            جمع مبلغ: {formatNumber(docData.debtorSum)} به شرح بالا در دفتر روزنامه ثبت گردید
          </p>
          <div className={styles.signature}>
            <div>مدیر آموزشگاه<br /></div>
            <div>نماینده شورای معلمان<br /></div>
            <div>نماینده انجمن اولیا و مربیان<br /></div>
          </div>
        </div>
      </div>
    </div>
  );
}