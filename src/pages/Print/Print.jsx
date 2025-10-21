// pages/PrintStudentReport.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Recordpdf from "../../components/Recordpdf/Recordpdf";
import api, { endpoints } from "../../config/api";

export default function Print() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();
  const navigate = useNavigate();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `,
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(endpoints.studentById(id));
        setStudent(res.data.data); // فرض می‌کنم سرورت اینطوری برگردونه
      } catch (err) {
        console.error("خطا در گرفتن اطلاعات دانش‌آموز:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (!student) return <p>دانش‌آموز یافت نشد</p>;

  return (
    <div>
      {/* toolbar */}
      <div className="no-print" style={{ padding: "10px", background: "#f1f1f1" }}>
        <button onClick={() => navigate(-1)}>بازگشت</button>
        <button onClick={handlePrint}>پرینت</button>
      </div>

      {/* کارنامه */}
      <div ref={componentRef}>
        <Recordpdf studentData={student} />
      </div>
    </div>
  );
}
