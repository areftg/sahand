import React, { useState } from 'react'
import styles from "./Sidebar.module.css";
import dashboard from "../../assets/icons/Dashboard.svg"
import hozor from "../../assets/icons/hozor&ghiyab.svg"
import asma from "../../assets/icons/asma.svg"
import asmafull from "../../assets/icons/asma-full-logo.svg"
import { NavLink } from "react-router-dom";
import list from "../../assets/icons/doc-list.svg"
import cheq from "../../assets/icons/cheque.svg"
import meet from "../../assets/icons/meeting.svg"
import insta from "../../assets/icons/insta.svg"
import llink from "../../assets/icons/link.svg"
import { useAuth } from "../../Context/AuthContext";


import accc from "../../assets/icons/record.svg"

export default function Sidebar() {
  const [open, setopen] = useState(false);
  const inm = () => {
    setopen(true);
  }
  const outm = () => {
    setopen(false);
  }
  const { user } = useAuth();

  if (user?.roles[0] === 'parent') {
    return (null)
  }
  return (
    <>
    <div className={styles.infohint} onClick={inm}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.6683 17.6981L26.5565 5.89823C27.0866 5.37239 27.0812 4.53105 26.5457 4.0052L24.4201 1.93865C23.8738 1.41281 22.9976 1.41281 22.4567 1.94391L7.32875 16.7463C7.05831 17.0093 6.9231 17.3511 6.9231 17.6981C6.9231 18.0452 7.05831 18.387 7.32875 18.6499L22.4567 33.4523C22.9976 33.9834 23.8738 33.9834 24.4201 33.4576L26.5457 31.391C27.0812 30.8652 27.0866 30.0238 26.5565 29.498L14.6683 17.6981Z" fill="white" />
        </svg>

      </div>
      <div className={open && styles.open} onClick={outm}>
      </div>
      <div className={`${styles.sidebar} ${open && styles.sidebaropen}`} onClick={inm} >
        <div onClick={(e) => { e.stopPropagation() }} className={styles.top}>
          {user?.roles[0] !== 'teacher' && (<NavLink to={'/'} className={styles.items} ><img alt='' src={dashboard} /><div className={styles.line} />{open && <p>داشبورد</p>}</NavLink>)}
          <NavLink to={'/Hozor'} className={styles.items} ><img alt='' src={hozor} /><div className={styles.line} /> {open && <p>حضور و غیاب</p>}</NavLink>
          <NavLink to={'/Record'} className={styles.items} ><img alt='' src={accc} /><div className={styles.line} />{open && <p>کارنامه و آمار تحصیلی</p>}</NavLink>

          {(user?.roles[0] === 'admin' || user?.roles[0] === 'principal') && (
            <div className={styles.bigitems}>
              <NavLink to={'/Accounting'} className={styles.under}>
                <img alt='' src={accc} />
                <div className={styles.line} />
                {open && <p>حسابداری</p>}
              </NavLink>
              <NavLink to={'/Accounting'} className={styles.under}>
                <img alt='' src={list} />
                <div className={styles.line} />
                {open && <p>لیست اسناد</p>}
              </NavLink>
              <NavLink to={'/Meetings'} className={styles.under}>
                <img alt='' src={meet} />
                <div className={styles.line} />
                {open && <p>جلسات</p>}
              </NavLink>
              <NavLink to={'/CheckList'} className={styles.under}>
                <img alt='' src={cheq} />
                <div className={styles.line} />
                {open && <p>لیست چک ها</p>}
              </NavLink>
            </div>
          )}



        </div>
        <div className={styles.bottom} >

          {open && <>
            <img src={asmafull} alt='Logo'></img>
            <div className={styles.bottomr}>
              <h3>تمامی حقوق محفوظ گروه اسما</h3>
              <p>وبسایت رسمی<img src={llink} alt='' /></p><p>AsmaGroup.ir<img src={insta} alt='' /></p>
            </div>
          </>}


          {!open && <img src={asma} alt='Logo'></img>}

        </div>
      </div>
      
    </>

  )
}
