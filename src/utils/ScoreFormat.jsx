import { useState, useEffect } from 'react';

function GradeInput({ onChange, className, value }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;

    // منطق اعتبارسنجی شما عالی است و حفظ می‌شود
    if (/^\d{0,2}(\.\d{0,2})?$/.test(val) || val === '') {
      const num = parseFloat(val);

      if (val === '' || (!isNaN(num) && num <= 20)) {
        // *** نکته کلیدی اصلاح شده ***
        // تابع onChange که از پدر آمده را فراخوانی می‌کنیم
        onChange(e);
      }
    }
  };

  return (
    <input
      type="text"
      // *** اصلاح شده *** : از className که از پدر آمده استفاده می‌کنیم
      className={className}
      // *** اصلاح شده *** : مقدار را مستقیما از پراپ value می‌خوانیم
      value={value}
      onChange={handleChange}
      placeholder={isMobile ? 'نمره' : 'نمره ای وارد نکرده اید'}
      // برای تجربه کاربری بهتر در موبایل
      inputMode="decimal"
    />
  );
}

export default GradeInput;