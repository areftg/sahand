import React, { useEffect, useState } from 'react';

import moment from 'moment-jalaali';

import styles from './CalendarPopup.module.css';



moment.loadPersian({ usePersianDigits: false });



export default function CalendarPopup() {

 const [year, setYear] = useState(moment().jYear());

 const [month, setMonth] = useState(moment().jMonth() + 1); // jMonth = 0-based

 const [daysData, setDaysData] = useState([]);



 useEffect(() => {

  const fileName = `${year}-${String(month).padStart(2, '0')}.json`;

  fetch(`/calendar-data/${fileName}`)

   .then(res => res.json())

   .then(data => setDaysData(data.days))

   .catch(() => setDaysData([]));

 }, [year, month]);



 const persianMonths = [

 "فروردین", "اردیبهشت", "خرداد",

 "تیر", "مرداد", "شهریور",

 "مهر", "آبان", "آذر",

 "دی", "بهمن", "اسفند"

];





 const getStartDayOfWeek = () => {

  const date = moment(`${year}/${month}/1`, 'jYYYY/jM/jD');

  return date.day(); // 0: یکشنبه ... 6: شنبه

 };



const renderDays = () => {

 const startDay = getStartDayOfWeek();

 const totalDays = daysData.length;

 const totalCells = startDay + totalDays;

 const totalRows = Math.ceil(totalCells / 7);

 const today = moment().format('jYYYY/jM/jD');



const isToday = (day) => {

 const thisDay = `${year}/${month}/${day}`;

 return today === thisDay;

};



 const rows = [];

 let dayIndex = 0;



 for (let week = 0; week < totalRows; week++) {

  const days = [];

  for (let dow = 0; dow < 7; dow++) {

   const cellNum = week * 7 + dow;

   if (cellNum < startDay || dayIndex >= totalDays) {

    days.push(<td key={`empty-${week}-${dow}`}></td>);

   } else {

    const day = daysData[dayIndex];

    days.push(

     <td

      key={day.day}

      title={day.note}

      className={`

  ${day.isHoliday ? styles.holiday : ''}

  ${isToday(day.day) ? styles.today : ''}

 `}

     >

      {day.day}

     </td>

    );

    dayIndex++;

   }

  }

  rows.push(<tr key={week}>{days}</tr>);

 }



 return rows;

};





 const nextMonth = () => {

  if (month === 12) {

   setMonth(1);

   setYear(y => y + 1);

  } else {

   setMonth(m => m + 1);

  }

 };



 const prevMonth = () => {

  if (month === 1) {

   setMonth(12);

   setYear(y => y - 1);

  } else {

   setMonth(m => m - 1);

  }

 };



 return (

  <div className={styles.calendar}>

 <div className={styles.header}>

  <div className={styles.headerr}><button className={styles.navButton} onClick={prevMonth}><svg width="20" height="20" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M1.80078 1.52246L8.30078 8.52246L1.80078 15.5225" stroke="#68B0AB" stroke-width="2" stroke-linecap="round"/>

</svg>

</button>

  <button style={{rotate:"180deg"}} className={styles.navButton} onClick={nextMonth}><svg width="20" height="20" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M1.80078 1.52246L8.30078 8.52246L1.80078 15.5225" stroke="#68B0AB" stroke-width="2" stroke-linecap="round"/>

</svg>

</button></div>

  <div className={styles.Yearname}>{year} {persianMonths[month - 1]}</div>

 

 </div>

 <div className={styles.popupWrapper}>

 <table className={styles.table}>

  <thead>

   <tr>

    <th>شنبه</th><th>یکشنبه</th><th>دوشنبه</th>

    <th>سه‌شنبه</th><th>چهارشنبه</th><th>پنجشنبه</th><th>جمعه</th>

   </tr>

  </thead>

  <tbody>

   {renderDays()}

  </tbody>

 </table>

 </div>

</div>



 );

}