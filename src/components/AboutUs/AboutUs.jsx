import React from 'react'
import style from "./AboutUs.module.css";
import Emza from '../../assets/icons/Emza.svg';
import SJM from '../../assets/icons/SJM.svg';
import ASMAG from '../../assets/icons/ASMAG.svg';
import buttonlink from '../../assets/icons/ButtonLink.svg';
import Asma from '../../assets/icons/ASMAGROUP.IR.svg';
import insta from '../../assets/icons/instagram.svg';

export default function AboutUs() {
  return (
    <div className={style.AboutUs}>
      <div className={style.top}>
        <div className={style.right}>
          <h1>سامانه ای برای</h1>
          <img src={Emza} alt="" />
        </div>
        <div className={style.left}>
          <div className={style.leftcontainer}>
        <div className={style.logos}>
          <img src={SJM} alt="" />
          <img src={ASMAG} alt="" />
        </div>
        <div className={style.links}>
          <a className={style.button}>
            <p>وبسایت رسمی</p>
            <img src={buttonlink} alt="" />
          </a>
          <a className={style.button}>
            <img src={Asma} alt="" />
            <img src={insta} alt="" />
          </a>
        </div>
        </div>
        </div>
      </div>
      <div className={style.center}>
        <p>درباره نرم افزار</p>
        <p>نسخه:V3 ReDesign</p>
        <p>
سامانه جامع مدارس، یک نرم‌افزار یکپارچه و نوآورانه برای مدیریت هوشمند فرایندهای آموزشی، پرورشی و اداری مدارس کشور است. این نسخه با طراحی مجدد و ارتقاء زیرساخت، تجربه‌ای سریع‌تر، ایمن‌تر و کارآمدتر را برای مدیران، معلمان، دانش‌آموزان و اولیا فراهم می‌کند.        </p>
        </div>
          <div className={style.center}>
        <p>توسعه داده شده توسط: تیم آرکانیکس از گروه اسما</p>
        <p> تمامی حقوق این نرم‌افزار متعلق به شرکت توسعه نوآوری اسما می‌باشد. هرگونه کپی‌برداری، بازنشر یا بهره‌برداری غیرمجاز از این محصول، پیگرد قانونی خواهد داشت.
        </p>
        </div>
        <div className={style.bottom}>
          <div className={style.item}>
            <p>ایمیل پشتیبانی: به زودی</p>
          </div>
          <div className={style.item}>
            <p>شماره تماس پشتیبانی (فقط روز های کاری، ساعت 8 تا 12):به زودی  </p>
          </div>
        </div>
    </div>
    
  )
}

