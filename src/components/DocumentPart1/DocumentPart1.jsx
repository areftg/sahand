import React, { useState, useEffect } from 'react';
import style from './DocumentPart1.module.css'
import Arrow from  '../../assets/icons/arrow.svg'
import { useFormData } from '../DocumentFrame/DocumentFrame'; 

export default function DocumentPart1() {
   const { formData, updateFormData, goToNextStep } = useFormData();
 
  return (
    <div className={style.DocumentPart1}>
        <div className={style.container}>
        <h1 className={style.title}>به بخش ثبت سند خوش آمدید</h1>
        <p>در این بخش میتوانید اسناد جدید خود را وارد کنید</p>
        </div>
        <button className={style.nextButton} onClick={()=>{goToNextStep()}}>
        مرحله بعدی <img src={Arrow} alt='' style={{ height: "20px" }} />
      </button>
    </div>
  )
}
