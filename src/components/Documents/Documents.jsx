import style from "./Documents.module.css";
import React, { useState, useEffect, useRef } from "react";
import Dropdown from "../DropDown/DropDown";
import Pen from "../../assets/icons/pan.svg";
import Trash from "../../assets/icons/Trash.svg";
import Print from "../../assets/icons/print.svg";
import DynamicTooltip from "../../components/DynamicTooltip/DynamicTooltip";
import api, { endpoints } from "../../config/api.js";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { showErrorNotification, showWarningNotification } from '../../services/notificationService';
import QuestionBox from '../../components/QuestionBox/QuestionBox';
import LoadingScreen from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import moment from 'jalali-moment';
import EditDocModal from '../EditDocModal/EditDocModal.jsx';
import FiscalYear from '../../Context/FiscalYear.jsx';
import { useNavigate } from "react-router-dom";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("date_desc");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLoadingStates, setEditLoadingStates] = useState({});
  const [isfinal, setIsfinal] = useState(false);

  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownToggle = (dropdownId) => {
    setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
  };

  const observer = useRef();




  // بررسی flag برای باز کردن مودال هنگام لود
  useEffect(() => {

    const openEditModal = localStorage.getItem('openEditModal');
    const formData = JSON.parse(localStorage.getItem('accountingDocumentFormData') || '{}');
    if (openEditModal === 'true' && formData.id) {
      setEditId(formData.id);
      setShowEditModal(true);
      // پاک کردن flag برای جلوگیری از باز شدن دوباره
      localStorage.removeItem('openEditModal');
    }
  }, []);

  const toPersianDigits = (str) => {
    if (!str || typeof str !== 'string') return '';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return str.replace(new RegExp(`[${englishDigits}]`, 'g'), (d) => persianDigits[englishDigits.indexOf(d)]);
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '۰ ریال';
    const formattedAmount = Number(amount).toLocaleString('fa-IR');
    return `${toPersianDigits(formattedAmount)} ریال`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const parsedDate = moment(date, ['YYYY-MM-DD', 'YYYYMMDD']);
    if (!parsedDate.isValid()) return '';
    return toPersianDigits(parsedDate.format('jYYYY/jMM/jDD'));
  };

  const extractErrorMessage = (error) => {
    const response = error.response?.data;
    if (!response) return 'خطا در ارتباط با سرور';
    if (Array.isArray(response.errors)) {
      return response.errors.join('، ');
    }
    if (response.errors && typeof response.errors === 'object') {
      return Object.values(response.errors).flat().join('، ');
    }
    if (response.message) {
      return response.message;
    }
    return 'خطا در انجام عملیات';
  };

  const lastDocElementRef = React.useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const fetchDocs = async () => {
      try {
        const response = await api.get(
          `${endpoints.docs}?page=${page}&sort_by=${sortBy}`
        );
        const responseData = response.data;

        if (isActive) {
          setDocs((prevDocs) => {
            return page === 1 ? responseData.data : [...prevDocs, ...responseData.data];
          });
          setHasMore(responseData.links?.next !== null);
        }
      } catch (error) {
        console.error("Documents: خطا در دریافت اسناد:", error);
        const errorMessage = extractErrorMessage(error);
        showErrorNotification(errorMessage);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };
    // setIsfinal(docs.is_fiscal_year_closed)
    // console.log('saas',isfinal);

    fetchDocs();

    return () => {
      isActive = false;
    };
  }, [page, sortBy]);

  const handleEditClick = async (id) => {
    try {
      setEditLoadingStates((prev) => ({ ...prev, [id]: true }));

      // حذف داده قبلی
      localStorage.removeItem('accountingDocumentFormData');

      // ایجاد مقدار جدید با edit=true
      const newData = { edit: true };
      localStorage.setItem('accountingDocumentFormData', JSON.stringify(newData));

      // گرفتن داده واقعی سند
      const response = await api.get(`${endpoints.docs}/${id}`);
      const docData = response.data.data;

      // merge کردن با edit=true
      const mergedData = { ...docData, edit: true };
      localStorage.setItem('accountingDocumentFormData', JSON.stringify(mergedData));

      setEditId(id);
      setShowEditModal(true);
    } catch (error) {
      console.error("Documents: خطا در دریافت اطلاعات سند:", error);
      const errorMessage = extractErrorMessage(error);
      showErrorNotification(errorMessage);
    } finally {
      setEditLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };


  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`${endpoints.docs}/${deleteId}`);
      setDocs((prevDocs) => prevDocs.filter((doc) => doc.id !== deleteId));
      showWarningNotification('سند با موفقیت حذف شد');
    } catch (error) {
      console.error("Documents: خطا در حذف سند:", error);
      const errorMessage = extractErrorMessage(error);
      showErrorNotification(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
    // پاک کردن localStorage هنگام بستن مودال
    localStorage.removeItem('accountingDocumentFormData');
    localStorage.removeItem('openEditModal');
  };

  const sortOptions = [
    { value: "date_desc", label: "مرتب‌سازی بر اساس تاریخ (جدیدتر)" },
    { value: "amount_asc", label: "مرتب‌سازی بر اساس مبلغ (صعودی)" },
    { value: "amount_desc", label: "مرتب‌سازی بر اساس مبلغ (نزولی)" },
  ];

  const handleSortChange = (option) => {
    if (option.value === sortBy) return;
    setSortBy(option.value);
    setPage(1);
  };

  const EditButton = ({ doc }) => (
    <button
      className={`${style.button} ${doc.is_fiscal_year_closed ? style.none : ""}`}
      onClick={
        !doc.is_fiscal_year_closed
          ? () => handleEditClick(doc.id)
          : (e) => {
            e.preventDefault();
            showWarningNotification("این سال مالی بسته شده و امکان ویرایش وجود ندارد.");
          }
      }
      disabled={editLoadingStates[doc.id]}
    >
      {editLoadingStates[doc.id] ? (
        <LoadingScreen />
      ) : (
        <img src={Pen} alt="ویرایش" />
      )}
    </button>
  );

  // تعریف کامپوننت DeleteButton
  const DeleteButton = ({ doc }) => (
    <button
      className={`${style.button} ${doc.is_fiscal_year_closed ? style.none : ""}`}
      onClick={
        !doc.is_fiscal_year_closed
          ? () => handleDeleteClick(doc.id)
          : (e) => {
            e.preventDefault();
            showWarningNotification("این سال مالی بسته شده و امکان حذف وجود ندارد.");
          }
      }
      disabled={doc.is_fiscal_year_closed || isDeleting}
    >
      <img src={Trash} alt="حذف" />
    </button>
  );


  return (
    <div className={style.container}>
      <FiscalYear />
      <div className={style.header}>
        <div className={style.right}>
          <svg width="32" height="26" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.55586 7.93516H23.2902V10.1664H6.55586V7.93516ZM6.55586 1.24141H23.2902V3.47266H6.55586V1.24141ZM6.55586 14.6289H23.2902V16.8602H6.55586V14.6289ZM2.09336 7.37734C1.64954 7.37734 1.22389 7.55365 0.91006 7.86748C0.59623 8.18131 0.419922 8.60696 0.419922 9.05078C0.419922 9.4946 0.59623 9.92025 0.91006 10.2341C1.22389 10.5479 1.64954 10.7242 2.09336 10.7242C2.53718 10.7242 2.96283 10.5479 3.27666 10.2341C3.59049 9.92025 3.7668 9.4946 3.7668 9.05078C3.7668 8.60696 3.59049 8.18131 3.27666 7.86748C2.96283 7.55365 2.53718 7.37734 2.09336 7.37734ZM2.09336 14.0711C1.64954 14.0711 1.22389 14.2474 0.91006 14.5612C0.59623 14.8751 0.419922 15.3007 0.419922 15.7445C0.419922 16.1884 0.59623 16.614 0.91006 16.9278C1.22389 17.2417 1.64954 17.418 2.09336 17.418C2.53718 17.418 2.96283 17.2417 3.27666 16.9278C3.59049 16.614 3.7668 16.1884 3.7668 15.7445C3.7668 15.3007 3.59049 14.8751 3.27666 14.5612C2.96283 14.2474 2.53718 14.0711 2.09336 14.0711ZM2.09336 0.683594C1.64954 0.683594 1.22389 0.859902 0.91006 1.17373C0.59623 1.48756 0.419922 1.91321 0.419922 2.35703C0.419922 2.80085 0.59623 3.2265 0.91006 3.54033C1.22389 3.85416 1.64954 4.03047 2.09336 4.03047C2.53718 4.03047 2.96283 3.85416 3.27666 3.54033C3.59049 3.2265 3.7668 2.80085 3.7668 2.35703C3.7668 1.91321 3.59049 1.48756 3.27666 1.17373C2.96283 0.859902 2.53718 0.683594 2.09336 0.683594Z" fill="white" />
          </svg>
          <h1>لیست اسناد</h1>
        </div>
        <div className={style.left}>
          <Dropdown options={sortOptions} defaultValue="مرتب‌سازی بر اساس تاریخ (جدیدتر)" onSelect={handleSortChange}
            isOpen={activeDropdown === 'docs-sort'}
            onToggle={() => handleDropdownToggle('docs-sort')} />
        </div>
      </div>

      <div className={style.title}>
        <div className={style.itemcontainer}>
          <div className={style.item}><p>ردیف</p></div>
          <div className={style.item}><p>تاریخ</p></div>
          <div className={style.item}><div className={style.text}><p className={style.textShort}>توضیحات</p></div></div>
          <div className={style.item}><p>مبلغ</p></div>
        </div>
        <div className={style.buttoncontainer}>
          <div className={style.item1}>ویرایش</div>
          <div className={style.item1}>حذف</div>
          <div className={style.item1}>پرینت</div>
          <div className={style.item1}>----</div>
        </div>
      </div>

      <div className={style.table}>
        {loading && page === 1 ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton
              key={idx}
              duration={2}
              highlightColor="#69b0b2"
              baseColor="#e0e0e0"
              height={50}
              style={{ margin: "8px 0", borderRadius: "6px" }}
            />
          ))
        ) : docs.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px" }}>هیچ سندی یافت نشد</p>
        ) : (
          docs.map((doc, index) => {
            const rowContent = (
              <>
                <div className={style.itemcontainer}>
                  <div className={style.item}><p>{toPersianDigits((index + 1).toString())}</p></div>
                  <div className={style.item}><p>{formatDate(doc.IssueDate)}</p></div>
                  <div className={style.item}>
                    <div className={style.text}>
                      <DynamicTooltip content={doc.description || "بدون توضیحات"}>
                        <p className={style.textShort}>{doc.Title || "بدون عنوان"}</p>
                      </DynamicTooltip>
                    </div>
                  </div>
                  <div className={style.item}><p>{formatAmount(doc.debtorSum)}</p></div>
                </div>
                <div className={style.buttoncontainer}>
                  {doc.is_fiscal_year_closed ? (
                    <DynamicTooltip content="سند در سال مالی بسته‌شده ثبت شده و امکان ویرایش یا عملیات روی آن وجود ندارد">
                      <EditButton doc={doc} />
                    </DynamicTooltip>
                  ) : (
                    <EditButton doc={doc} />
                  )}

                  {doc.is_fiscal_year_closed ? (
                    <DynamicTooltip content="سند در سال مالی بسته‌شده ثبت شده و امکان حذف وجود ندارد">
                      <DeleteButton doc={doc} />
                    </DynamicTooltip>
                  ) : (
                    <DeleteButton doc={doc} />
                  )}

                  <button className={`${style.button}`} onClick={()=>{navigate(`/Printdoc/${doc.id}`)}}>
                    <img src={Print} alt="پرینت" />
                  </button>
                  <button className={`${style.button} ${style.none}`}>
                    {/* <img src={Editcheck} alt="چک‌ها" /> */}
                  </button>
                </div>
              </>
            );

            if (docs.length === index + 1) {
              return (
                <div className={style.row} ref={lastDocElementRef} key={doc.id}>
                  {rowContent}
                </div>
              );
            }
            return (
              <div className={style.row} key={doc.id}>
                {rowContent}
              </div>
            );
          })
        )}

        {loading && page > 1 && (
          Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              duration={2}
              highlightColor="#69b0b2"
              baseColor="#e0e0e0"
              height={50}
              style={{ margin: "8px 0", borderRadius: "6px" }}
            />
          ))
        )}

        {!hasMore && docs.length > 0 && (
          <p style={{ textAlign: "center", padding: "20px" }}>پایان لیست اسناد</p>
        )}
      </div>

      {
        showDeleteConfirm && (
          <QuestionBox
            message="آیا مطمئن هستید که می‌خواهید این سند را حذف کنید؟"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            isLoading={isDeleting}
            loadingComponent={<LoadingScreen />}
          />
        )
      }

      {
        showEditModal && (
          <EditDocModal onClose={closeEditModal} />
        )
      }
    </div >
  );
}

