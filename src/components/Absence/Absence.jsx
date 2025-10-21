import React, { useState } from 'react';
import styles from './Absence.module.css';
import ghayeb from '../../assets/icons/ghayeb.svg';

import deleted from '../../assets/icons/deleted.svg';
import api, { endpoints } from "../../config/api";
import { useAbsence } from "../../Context/AbsenceContext";
import moment from 'moment-jalaali';
import { showSuccessNotification, showErrorNotification } from "../../services/notificationService";
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function Absence() {
  const {
    studentStatuses,
    removeAbsent,
    ss,
    absents,
    searchQuery,
    setSearchQuery,
    sdate
  } = useAbsence();

  const [isloading,setisloading] = useState(false);

  moment.loadPersian({ usePersianDigits: false });
  const today = moment().format('jYYYY/jMM/jDD');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
     
  const handleSubmit = async () => {

    if (!ss) {
      showErrorNotification("کلاس یا زنگ برای ثبت غیبت مشخص نشده است.");
      return;
    }
       setisloading(true);
    // Determine the session date based on user role
    const sessionDate = user?.role.name === 'teacher' ? today : sdate;
   

    try {
   
      const url = endpoints.hozorsub(ss);
      const payload = {
        session_date: sessionDate,
        attendances: Object.entries(studentStatuses).map(([enrollment_id, status]) => ({
          enrollment_id: parseInt(enrollment_id, 10),
          status
        }))
      };

      await api.post(url, payload);
      showSuccessNotification("تغییرات با موفقیت ثبت شد");
         
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "ثبت تغییرات با مشکل مواجه شد";
      showErrorNotification(errorMessage);
    }
    setisloading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <input
          type="text"
          placeholder="جستجوی نام دانش‌آموز..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
         <button className={styles.mobilebut} onClick={handleSubmit}>{isloading ? <LoadingSpinner/> : `ثبت نهایی غیبت ها`}</button>
      </div>

      <h3><img src={ghayeb} alt="" />اسامی غایبین:</h3>

      <div className={styles.row}>
        {absents.length === 0 ? (
          <p style={{ marginRight: '10px' }}>هیچ دانش‌آموزی غایب نیست.</p>
        ) : (
          absents.map((student) => (
            <div
              key={student.enrollment_id}
              className={styles.box}
              onClick={() => removeAbsent(student.enrollment_id)}
              title="برای حاضر زدن کلیک کنید"
            >
              <img src={deleted} alt="حذف از غایبین" />
              <p>{student.full_name}</p>
            </div>
          ))
        )}
      </div>
      <button className={styles.mobilebut} onClick={handleSubmit}>{isloading ? <LoadingSpinner/> : `ثبت نهایی غیبت ها`}</button>
    </div>
  );
}