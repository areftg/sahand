import { createContext, useContext, useState } from 'react';

const AbsenceContext = createContext();
export const useAbsence = () => useContext(AbsenceContext);

export const AbsenceProvider = ({ children }) => {
  const [studentStatuses, setStudentStatuses] = useState({});
  const [ss, setSs] = useState(null);
  const [sdate, setSdate] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // استیت برای جستجو

  // تغییر وضعیت دانش‌آموز
  const setStatus = (studentId, status) => {
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  // مقداردهی اولیه (وقتی لیست دانش‌آموز از API اومد)
  const setInitialStatuses = (statuses) => {
    setStudentStatuses(statuses);
  };

  // ست کردن کل لیست دانش‌آموزها
  const setInitialStudents = (list) => {
    setStudents(list);
  };

  // ریست همه وضعیت‌ها
  const resetStatuses = () => {
    setStudentStatuses({});
  };

  // فیلتر آماده: فقط غایب‌ها
  const absents = students.filter(
    (s) => studentStatuses[s.enrollment_id] === "absent"
  );

  const removeAbsent = (id) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [id]: "present"   // وقتی حذف بشه، دوباره حاضر میشه
    }));
  };
  

  return (
    <AbsenceContext.Provider
      value={{
        studentStatuses,
        setStatus,
        setInitialStatuses,
        resetStatuses,
        ss, setSs,
        students, setInitialStudents,
        setStudents,
        absents,
        removeAbsent,
        searchQuery,      // ارسال مقدار جستجو
        setSearchQuery,   // ارسال تابع برای آپدیت جستجو
        sdate, setSdate
      }}
    >
      {children}
    </AbsenceContext.Provider>
  );
};