import style from './Check.module.css';
import React, { useState, useEffect, useRef, useMemo } from "react";
import Dropdown from "../DropDown/DropDown";
import Pan from "../../assets/icons/pan.svg";
import Trash from "../../assets/icons/Trash.svg";
import Editcheck from "../../assets/icons/Editcheck.svg";
import Print from "../../assets/icons/print.svg";
import Close from "../../assets/icons/close.svg";
import DynamicTooltip from "../../components/DynamicTooltip/DynamicTooltip";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api, { endpoints } from "../../config/api.js";
import { showSuccessNotification, showErrorNotification } from "../../services/notificationService";

const getErrorMessage = (error) => {
 if (error.response && error.response.data) {
  if (error.response.data.message) {
   return error.response.data.message;
  }
  if (error.response.data.error) {
   return error.response.data.error;
  }
  if (typeof error.response.data === 'string') {
   return error.response.data;
  }
 }
 return 'عملیات با شکست مواجه شد. لطفاً دوباره تلاش کنید.';
};

export default function Check({ onAddSuccess, refreshKey }) {
 const [chequebooks, setChequebooks] = useState([]);
 const [page, setPage] = useState(1);
 const [loading, setLoading] = useState(false);
 const [hasMore, setHasMore] = useState(true);
 const [sortBy, setSortBy] = useState("date_desc");
 const [checkedId, setCheckedId] = useState(null);
 const [selectedChequebookId, setSelectedChequebookId] = useState(null);
 const [isDeleting, setIsDeleting] = useState(false);
 const [isActivating, setIsActivating] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [editChequebook, setEditChequebook] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const [showQuestion, setShowQuestion] = useState(false);
 const [actionType, setActionType] = useState(null);

  // مرحله ۱: State برای مدیریت دراپ‌دان فعال
  const [activeDropdown, setActiveDropdown] = useState(null);
 
 const observer = useRef();

 const fetchChequebooks = async (reset = false) => {
  let isActive = true;
  setLoading(true);
  if (reset) {
   setPage(1);
   setChequebooks([]);
  }
  try {
   const response = await api.get(
    `${endpoints.chequebooks}?page=${reset ? 1 : page}}`
   );
   const responseData = response.data;
   console.log('Check: API response for GET /chequebooks:', responseData);

   if (isActive) {
    const newChequebooks = reset || page === 1 ? responseData.data : [...chequebooks, ...responseData.data];
    setChequebooks(newChequebooks);
    setHasMore(responseData.links.next !== null);
    console.log('Check: Chequebooks loaded:', newChequebooks);
   }
  } catch (error) {
   console.error("Check: Error fetching chequebooks:", error);
   if (isActive) {
    showErrorNotification(getErrorMessage(error));
   }
  } finally {
   if (isActive) {
    setLoading(false);
   }
  }
  return () => {
   isActive = false;
  };
 };

 useEffect(() => {
  console.log('Check: refreshKey changed:', refreshKey);
  fetchChequebooks(true);
 }, [refreshKey, sortBy]);

 useEffect(() => {
  fetchChequebooks();
 }, [page]);

 useEffect(() => {
  const savedCheckedId = localStorage.getItem('activeChequebookId');
  const activeChequebook = chequebooks.find((chequebook) => chequebook.isActive);
  if (activeChequebook) {
   setCheckedId(activeChequebook.id);
   localStorage.setItem('activeChequebookId', activeChequebook.id);
   console.log('Check: Set checkedId based on isActive:', activeChequebook.id);
  } else if (savedCheckedId && chequebooks.some((chequebook) => chequebook.id === savedCheckedId)) {
   setCheckedId(savedCheckedId);
   console.log('Check: Set checkedId from localStorage:', savedCheckedId);
  } else {
   setCheckedId(null);
   localStorage.removeItem('activeChequebookId');
   console.log('Check: Removed checkedId from localStorage');
  }
 }, [chequebooks]);

 useEffect(() => {
  if (checkedId) {
   localStorage.setItem('activeChequebookId', checkedId);
   console.log(`Check: Stored checkedId in localStorage: ${checkedId}`);
  } else {
   localStorage.removeItem('activeChequebookId');
   console.log('Check: Removed checkedId from localStorage');
  }
 }, [checkedId]);

 const lastChequebookElementRef = useMemo(() => {
  return (node) => {
   if (loading) return;
   if (observer.current) observer.current.disconnect();
   observer.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore) {
     setPage((prevPage) => prevPage + 1);
    }
   });
   if (node) observer.current.observe(node);
  };
 }, [loading, hasMore]);
 
  // مرحله ۲: تابع کنترل‌کننده برای دراپ‌دان
  const handleDropdownToggle = (dropdownId) => {
    setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
  };

 const handleDelete = async (id) => {
  setSelectedChequebookId(id);
  setActionType('delete');
  setShowQuestion(true);
 };

 const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
   await api.delete(`${endpoints.chequebooks}/${selectedChequebookId}`);
   setChequebooks((prevChequebooks) =>
    prevChequebooks.filter((chequebook) => chequebook.id !== selectedChequebookId)
   );
   if (selectedChequebookId === checkedId) {
    setCheckedId(null);
   }
   showSuccessNotification("دسته‌چک با موفقیت حذف شد.");
  } catch (error) {
   console.error("Check: Error deleting chequebook:", error);
   showErrorNotification(getErrorMessage(error));
  } finally {
   setIsDeleting(false);
   setShowQuestion(false);
   setSelectedChequebookId(null);
   setActionType(null);
  }
 };

 const handleActivate = (id) => {
  const currentChequebook = chequebooks.find((chequebook) => chequebook.id === id);
  if (currentChequebook?.isActive) {
   console.log('Check: Selected chequebook is already active.');
   return;
  }

  setSelectedChequebookId(id);
  setActionType('activate');
  setShowQuestion(true);
 };

 const handleConfirmActivate = async () => {
  setIsActivating(true);
  try {
   await api.post(`${endpoints.chequebooks}/${selectedChequebookId}/activate`);
   setChequebooks((prevChequebooks) =>
    prevChequebooks.map((chequebook) =>
     chequebook.id === selectedChequebookId
      ? { ...chequebook, isActive: true }
      : { ...chequebook, isActive: false }
    )
   );
   setCheckedId(selectedChequebookId);
   showSuccessNotification("دسته‌چک با موفقیت فعال شد.");
  } catch (error) {
   console.error("Check: Error activating chequebook:", error);
   showErrorNotification(getErrorMessage(error));
  } finally {
   setIsActivating(false);
   setShowQuestion(false);
   setSelectedChequebookId(null);
   setActionType(null);
  }
 };

 const handleEdit = (chequebook) => {
  setEditChequebook({
   id: chequebook.id,
   title: chequebook.title || '',
   startSerial: chequebook.startSerial || '',
   endSerial: chequebook.endSerial || '',
   bankAccount: chequebook.bankAccount || null,
  });
  setIsEditModalOpen(true);
 };

 const handleEditSubmit = async () => {
  if (!editChequebook.title.trim() || !editChequebook.startSerial || !editChequebook.endSerial || !editChequebook.bankAccount) {
   showErrorNotification('تمام فیلدها باید پر شوند.');
   return;
  }
  const start = parseInt(convertEnglishToPersianNumbers(editChequebook.startSerial));
  const end = parseInt(convertEnglishToPersianNumbers(editChequebook.endSerial));
  if (end < start) {
   showErrorNotification('شماره سریال پایان باید بزرگ‌تر سریال شروع باشد.');
   return;
  }
  const numberOfCheques = end - start + 1;
  if (numberOfCheques <= 0) {
   showErrorNotification('تعداد چک‌ها باید بیشتر از صفر باشد.');
   return;
  }

  try {
   setIsLoading(true);
   const payload = {
    Title: editChequebook.title.trim(),
    StartSerialNo: parseInt(convertEnglishToPersianNumbers(editChequebook.startSerial)),
    EndSerialNo: parseInt(convertEnglishToPersianNumbers(editChequebook.endSerial)),
    AccountID: editChequebook.bankAccount?.id,
   };
   await api.patch(`${endpoints.chequebooks}/${editChequebook.id}`, payload);
   showSuccessNotification('دسته‌چک با موفقیت ویرایش شد.');
   setIsEditModalOpen(false);
   setEditChequebook(null);
   await fetchChequebooks(true);
  } catch (error) {
   console.error('Check: Error editing chequebook:', error);
   showErrorNotification(getErrorMessage(error));
  } finally {
   setIsLoading(false);
  }
 };

 const sortOptions = useMemo(
  () => [
   { value: "date_desc", label: "به ترتیب تاریخ (جدیدترین)" },
   { value: "amount_asc", label: "به ترتیب مبلغ (صعودی)" },
   { value: "amount_desc", label: "به ترتیب مبلغ (نزولی)" },
  ],
  []
 );
 
 const handleSortChange = (option) => {
  if (option.value === sortBy) return;
  setSortBy(option.value);
  setPage(1);
  setChequebooks([]);
 };

 const formatDate = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return "نامعتبر";
  return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
 };
 
 const convertEnglishToPersianNumbers = (input) => {
  if (input === null || input === undefined || input === '') return '';
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = input.toString();
  englishNumbers.forEach((english, index) => {
   result = result.replace(new RegExp(english, 'g'), persianNumbers[index]);
  });
  return result;
 };
 return (
  <div className={style.container}>
   <div className={style.header}>
    <div className={style.right}>
     <svg
      width="32"
      height="26"
      viewBox="0 0 24 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="آیکون دسته‌چک"
     >
      <path
       d="M6.55586 7.93516H23.2902V10.1664H6.55586V7.93516ZM6.55586 1.24141H23.2902V3.47266H6.55586V1.24141ZM6.55586 14.6289H23.2902V16.8602H6.55586V14.6289ZM2.09336 7.37734C1.64954 7.37734 1.22389 7.55365 0.91006 7.86748C0.59623 8.18131 0.419922 8.60696 0.419922 9.05078C0.419922 9.4946 0.59623 9.92025 0.91006 10.2341C1.22389 10.5479 1.64954 10.7242 2.09336 10.7242C2.53718 10.7242 2.96283 10.5479 3.27666 10.2341C3.59049 9.92025 3.7668 9.4946 3.7668 9.05078C3.7668 8.60696 3.59049 8.18131 3.27666 7.86748C2.96283 7.55365 2.53718 7.37734 2.09336 7.37734ZM2.09336 14.0711C1.64954 14.0711 1.22389 14.2474 0.91006 14.5612C0.59623 14.8751 0.419922 15.3007 0.419922 15.7445C0.419922 16.1884 0.59623 16.614 0.91006 16.9278C1.22389 17.2417 1.64954 17.418 2.09336 17.418C2.53718 17.418 2.96283 17.2417 3.27666 16.9278C3.59049 16.614 3.7668 16.1884 3.7668 15.7445C3.7668 15.3007 3.59049 14.8751 3.27666 14.5612C2.96283 14.2474 2.53718 14.0711 2.09336 14.0711ZM2.09336 0.683594C1.64954 0.683594 1.22389 0.859902 0.91006 1.17373C0.59623 1.48756 0.419922 1.91321 0.419922 2.35703C0.419922 2.80085 0.59623 3.2265 0.91006 3.54033C1.22389 3.85416 1.64954 4.03047 2.09336 4.03047C2.53718 4.03047 2.96283 3.85416 3.27666 3.54033C3.59049 3.2265 3.7668 2.80085 3.7668 2.35703C3.7668 1.91321 3.59049 1.48756 3.27666 1.17373C2.96283 0.859902 2.53718 0.683594 2.09336 0.683594Z"
       fill="white"
      />
     </svg>
     <h1>لیست دسته‌چک‌ها</h1>
    </div>
    <div className={style.left}>
      {/* مرحله ۳: پاس دادن props به Dropdown */}
      <Dropdown
       options={sortOptions}
       defualt={"به ترتیب تاریخ"}
       onSelect={handleSortChange}
       aria-label="مرتب‌سازی دسته‌چک‌ها"
                isOpen={activeDropdown === 'check-sort'}
                onToggle={() => handleDropdownToggle('check-sort')}
      />
    </div>
   </div>
   <div className={style.title}>
    <div className={` ${style.item} ${style.hederitem}`}>
     <p>ردیف</p>
    </div>
    <div className={` ${style.item} ${style.headeritem}`}>
     <p>عنوان دسته‌چک</p>
    </div>
    <div className={` ${style.item} ${style.headeritem}`}>
     <p>سریال شروع</p>
    </div>
    <div className={` ${style.item} ${style.headeritem}`}>
     <p>سریال پایان</p>
    </div>
    <div className={` ${style.item} ${style.headeritem}`}>
     <p>تعداد برگ‌های صادره</p>
    </div>
    <div className={` ${style.item} ${style.headeritem}`}>
     <p>تعداد برگ‌های باقیمانده</p>
    </div>
    <button className={style.button} aria-label="وضعیت جاری">
     جاری؟
    </button>
    <button className={style.button} aria-label="ویرایش دسته‌چک">
     ویرایش
    </button>
    <button className={style.button} aria-label="حذف دسته‌چک">
     حذف
    </button>
   </div>
   <div className={style.table}>
    {loading && page === 1 ? (
     Array.from({ length: 5 }).map((_, idx) => (
      <Skeleton
       key={idx}
       duration={2}
       highlightColor="#69b0b2"
       count={1}
       style={{ margin: "8px 0", borderRadius: "6px", padding: "30px 0" }}
       height={50}
      />
     ))
    ) : chequebooks.length === 0 ? (
     <p style={{ textAlign: "center", padding: "20px" }}>
      هیچ دسته‌چکی یافت نشد.
     </p>
    ) : (
     chequebooks.map((chequebook, index) => (
      <div
       className={style.row}
       key={chequebook.id}
       ref={chequebooks.length === index + 1 ? lastChequebookElementRef : null}
      >
       <div className={style.item}>
        <p>{index + 1}</p>
       </div>
       <div className={style.item}>
        <p>{chequebook.title || "بدون عنوان"}</p>
       </div>
       <div className={style.item}>
        <p>{convertEnglishToPersianNumbers(chequebook.startSerial) || "نامشخص"}</p>
       </div>
       <div className={style.item}>
        <p>{convertEnglishToPersianNumbers(chequebook.endSerial) || "نامشخص"}</p>
       </div>
       <div className={style.item}>
        <p>{convertEnglishToPersianNumbers(chequebook.stats?.used_cheques_count) ?? 'پیدا نشد'}</p>
       </div>
       <div className={style.item}>
        <p>{convertEnglishToPersianNumbers(chequebook.stats?.remaining_cheques_count) ?? 'پیدا نشد'}</p>
       </div>
       <button
        onClick={() => handleActivate(chequebook.id)}
        className={`${style.button} ${style.button1}`}
        aria-label={`تغییر وضعیت جاری برای دسته‌چک ${chequebook.title}`}
        disabled={isDeleting || isActivating}
       >
        {isActivating && selectedChequebookId === chequebook.id ? (
         <Skeleton width="30px" height="30px" circle={true} />
        ) : (
         <div className={style.checkbox}>
          {chequebook.isActive && (
           <div className={style.innerCircle}></div>
          )}
         </div>
        )}
       </button>
       <button
        onClick={() => handleEdit(chequebook)}
        className={style.button}
        aria-label={`ویرایش دسته‌چک ${chequebook.title}`}
        disabled={isDeleting || isActivating}
       >
        <img src={Editcheck} alt="آیکون ویرایش" />
       </button>
       <button
        onClick={() => handleDelete(chequebook.id)}
        className={style.button}
        aria-label={`حذف دسته‌چک ${chequebook.title}`}
        disabled={isDeleting || isActivating}
       >
        {isDeleting && selectedChequebookId === chequebook.id ? (
         <Skeleton width="20px" height="20px" circle={true} />
        ) : (
         <img src={Trash} alt="آیکون حذف" />
        )}
       </button>
      </div>
     ))
    )}
    {loading && page > 1 && (
     Array.from({ length: 2 }).map((_, idx) => (
      <Skeleton
       key={idx}
       duration={2}
       highlightColor="#69b0b2"
       count={1}
       style={{ margin: "1px 0", borderRadius: "6px" }}
       height={50}
      />
     ))
    )}
    {!hasMore && chequebooks.length > 0 && (
     <p style={{ textAlign: "center", padding: "20px" }}>
      شما به انتهای لیست رسیده‌اید.
     </p>
    )}
    {showQuestion && (
     <QuestionBox
      message={
       actionType === 'delete'
        ? 'آیا مطمئن هستید که می‌خواهید این دسته‌چک را حذف کنید؟'
        : 'آیا مطمئن هستید که می‌خواهید این دسته‌چک را فعال کنید؟'
      }
      onConfirm={actionType === 'delete' ? handleConfirmDelete : handleConfirmActivate}
      onCancel={() => {
       setShowQuestion(false);
       setSelectedChequebookId(null);
       setActionType(null);
      }}
      isLoading={actionType === 'delete' ? isDeleting : isActivating}
     />
    )}
   </div>

   {isEditModalOpen && (
    <div className={style.modal}>
     <div className={style.modalContent}>
      <div className={style.header}>
       <div onClick={() => setIsEditModalOpen(false)} className={style.checkbox}>
        <img src={Close} alt="بستن" />
       </div>
       <h2 className={style.title}>ویرایش دسته‌چک</h2>
      </div>
      <div className={style.box}>
       <div className={style.item}>
        <p className={style.placeholder}>شماره حساب:</p>
        <div className={style.score}>
         <p>
          {editChequebook.bankAccount
           ? `${convertEnglishToPersianNumbers(editChequebook.bankAccount.bank_account_no)} - ${editChequebook.bankAccount.bank_name}`
           : 'در حال بارگذاری...'}
         </p>
        </div>
       </div>
       <div className={style.item}>
        <p className={style.placeholder}>عنوان دسته چک:</p>
        <input
         type="text"
         className={style.input}
         value={editChequebook.title}
         onChange={(e) => setEditChequebook({ ...editChequebook, title: e.target.value })}
         placeholder="عنوان دسته‌چک"
        />
       </div>
       <div className={style.item}>
        <p className={style.placeholder}>شماره سریال شروع:</p>
        <input
         type="text"
         className={style.input}
         value={convertEnglishToPersianNumbers(editChequebook.startSerial) || ''}
         onChange={(e) => setEditChequebook({ ...editChequebook, startSerial: e.target.value })}
         placeholder="سریال شروع"
        />
       </div>
       <div className={style.item}>
        <p className={style.placeholder}>شماره سریال پایان:</p>
        <input
         type="text"
         className={style.input}
         value={convertEnglishToPersianNumbers(editChequebook.endSerial) || ''}
         onChange={(e) => setEditChequebook({ ...editChequebook, endSerial: e.target.value })}
         placeholder="سریال پایان"
        />
       </div>
      </div>
      <div className={style.footer}>
       <button className={style.button} onClick={handleEditSubmit} disabled={isLoading}>
        {isLoading ? <Skeleton width="60px" height="20px" /> : 'تأیید'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}