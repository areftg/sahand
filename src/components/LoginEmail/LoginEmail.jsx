import React from 'react'
import style from "./LoginEmail.module.css"
import support from "../../assets/icons/suport.svg"

export default function LoginEmail() {
      const email = "help.arcanix@gmail.com";
  const subject = "  موضوع ایمیل";
  const body = "";

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleClick = () => {
    // باز کردن mailto (معمولاً کلاینت ایمیل پیش‌فرض را باز می‌کند)
    window.location.href = mailtoLink;
    // یا می‌توانید از window.open(mailtoLink) استفاده کنید
  };
    return (
        <div onClick={handleClick} className={style.container} >
           <img src={support} alt='' />
           <div className={style.line} />
           <p>ایمیل پشتیبانی: help.arcanix@gmail.com</p>
        </div>
    )
}
