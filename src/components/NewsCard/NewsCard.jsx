import React,{useState} from 'react'
import styles from "./NewsCard.module.css"


export default function NewsCard() {
    
  const [news, setNews] = useState([
    {
      id: 1,
      title: "ثبت نام دانش آموزان کلاس اول شروع شد.",
      date: "1402/06/01"
    },
    {
      id: 2,
      title: "برگزاری آزمون ورودی پایه دهم",
      date: "1402/06/05"
    },
    {
      id: 3,
      title: "اطلاعیه تعطیلی مدارس در روزهای بارانی",
      date: "1402/06/10"
    }
  ]);
 
  
  return (
        <div className={styles.n}>
            
            <p>ثبت نام دانش آموزان کلاس اول شروع شد.</p>
           <button className={styles.showMoreButton} >
            <a href=''>  {"مشاهده ی کامل اطلاعیه"}</a>
           </button>
        </div>
  )}
