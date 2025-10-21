import React, { useState, useEffect } from 'react';
import styles from './StudentInfoTile.module.css'
import DropdownLarge from "../DropDownLarge/DropDown";
import name from '../../assets/icons/name.svg';
import none from '../../assets/icons/none.svg';
import clocknone from '../../assets/icons/clocknone.svg';
import riseup from '../../assets/icons/riseup.svg';
import { useNavigate } from 'react-router-dom';
import { useParams} from 'react-router-dom';
import api, { endpoints } from "../../config/api";
import profile from "../../assets/icons/defaultprofile.svg"


export default function StudentInfoTile({studata}) {
    const navigate = useNavigate();
    
    
    


    const options = [
        { value: "1", label: "نمودار‌سوابق‌غیبت" },
          { value: "2", label: "سوابق‌نمره" },
       { value: "3", label: "لیست‌‌‌سوابق‌غیبت" },
     
     ];

     const defaultOption = options[0];
     
      const handleSelect = (option) => {

  if (option.value === "1") {
    navigate("");
  } else if (option.value === "2") {
    navigate("scorerow");
  } else if (option.value === "3") {
    navigate("Absencelist");
  }
};


  return (
    <div className={styles.container}>
        <div style={{display:"none"}} className={styles.item}>
          <img className={styles.image} src={profile} alt="" />
        </div>
        <div className={styles.mitem}>
          <div>
            <h3>نام و نام خانوادگی</h3>
            <h2>{studata?.profile?.first_name} {studata?.profile?.last_name}</h2>
          </div>
          <div>
            <h3>میانگین نمرات</h3>
          </div>
        </div>
      <div  className={styles.item}>

        <div className={styles.header}>
         <p>نام و نام خانوادگی</p>
         <img src={name} alt=''/>
         
        </div>
           <div className={styles.content}>
        <h1>{studata?.profile?.first_name} {studata?.profile?.last_name}</h1>


     </div>
       </div>
       <div style={{display:"none"}} className={styles.item}>

          <div className={styles.header}>
          <p>تعداد غیبت های روزانه</p>
                 <img src={none} alt=''/>
          </div>
             <div className={styles.content}>
          <h1>15 روز</h1>
          </div>
    </div>
     <div style={{display:"none"}} className={styles.item}>
 
       <div className={styles.header}>
         <p>ساعت های غایب بودن</p>
         <img src={clocknone} alt=''/>
       </div>
         <div className={styles.content}>
       <h1>25ساعت</h1>
       </div>
      </div>
      <div className={styles.item}>

         <div className={styles.header}>
           <p>تنظیم سوابق بر اساس:</p>
           <img src={riseup} alt=''/>
         </div>
           <div className={styles.content}> <DropdownLarge
  options={options}
  defaultValue={defaultOption}
  onSelect={handleSelect}
/></div>
       </div>
    </div>
  )
}
