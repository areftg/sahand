import React from 'react'
import style from "./LoginFooter.module.css"
import support from "../../assets/icons/suport.svg"
import info from "../../assets/icons/infowhite.svg"
import asma from "../../assets/icons/asamgray.svg"

export default function LoginFooter() {
  return (
    <div className={style.container}>
      <div className={style.right}>
        <div className={style.box}>
          <img src={support} alt="support" />
          <div className={style.line} />
          <p>پشتیبانی</p>
        </div>
        <div className={style.box}>
          <img src={info} alt="info" />
          <div className={style.line} />
          <p>سوالات متداول</p>
        </div>
      </div>
      <div className={style.left}>
        <div className={style.text}>
          <h4>طراحی، ساخت و برنامه نویسی توسط: گروه اسما</h4>
          <h4>اینستاگرام ما: asmagroup.ir وبسایت: by-asma.ir</h4>
        </div>
        <img src={asma} alt="asma" />

      </div>
    </div>
  )
}
