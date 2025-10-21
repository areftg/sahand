import React, { useRef, useEffect, useState } from 'react';
import style from "./ChatBox.module.css";
import chatsend from "../../assets/icons/chatsend.svg";
import emoje from "../../assets/icons/emoje.svg";
import chatitem from "../../assets/icons/chatitem.svg";

export default function ChatBox() {
  // 1. ارجاع به المان textarea
  const textareaRef = useRef(null);
  // 2. مدیریت متن داخل textarea
  const [message, setMessage] = useState('');


  useEffect(() => {
    if (textareaRef.current) {
      // ارتفاع را موقتاً روی 'auto' تنظیم می‌کنیم تا scrollHeight به درستی محاسبه شود.
      textareaRef.current.style.height = 'auto';
      // ارتفاع textarea را برابر با ارتفاع محتوای آن (scrollHeight) قرار می‌دهیم.
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]); // 'message' به عنوان dependency (وابستگی) مشخص شده است.

  // 4. تابع برای به‌روزرسانی متن هنگام تایپ
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

 
  const handleKeyDown = (event) => {
   
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
     
      setMessage(''); 
    }
 
  };
   
  const handlesend = (event) => {
      event.preventDefault(); 
  
      setMessage(''); 
    
 
  };

  return (
    <div className={style.chatbox}>
      <div onClick={handlesend} className={style.chatsend}><img src={chatsend} alt='ارسال پیام' /><p>ارسال</p></div>
      <img className={`${style.imgbox} ${style.resimgbox}`} src={emoje} alt='ایموجی' />
      <textarea
        ref={textareaRef} 
        className={style.chattext}
        placeholder='چیزی بنویسید...'
        value={message}
        onChange={handleInputChange} 
        onKeyDown={handleKeyDown} 
        rows={1} 
      ></textarea>
      <img className={style.imgbox} src={chatitem} alt='آیتم چت' />
    </div>
  );
}