import React from 'react';

// تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (num) => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(num).replace(/\d/g, d => persianDigits[d]);
};

// جدا کردن سه رقم سه رقم
const separateByComma = (num) => {
  // حذف کاراکترهای غیر عددی و تبدیل به عدد
  const englishNum = String(num).replace(/[^\d]/g, '');
  const formatted = englishNum.replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(formatted);
};

export default function PersianNumberFormatter({ number, className , style}) {
  return <span className={className} style={style}>{separateByComma(number)}</span>;
}
