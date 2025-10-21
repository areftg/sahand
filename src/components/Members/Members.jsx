import style from "./Members.module.css";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { showErrorNotification } from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import QuestionBox from "../QuestionBox/QuestionBox"; // اضافه شد
import iconmembers from "../../assets/icons/memberwhite.svg"
import Dropdown from "../DropDown/DropDown";
import api, { endpoints } from "../../config/api";
import deleteIcon from "../../assets/icons/delete.svg";
import editIcon from "../../assets/icons/edit.svg";

// آبجکت برای ترجمه نقش‌ها به فارسی
const roleTranslations = {
  teacher: 'معلم',
  principal: 'مدیر',
  'deputy-executive': 'معاون اجرایی',
  // در صورت نیاز می‌توانید نقش‌های دیگر را اینجا اضافه کنید
};
const useAuth = () => {
  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {

        return null;
      }
    }
    return null;
  }, []);
  return { user };
};

const toPersianDigits = (num) => {
  // اگر ورودی null یا undefined است، همان را برگردان
  if (num === null || num === undefined) return '';

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const ScrollableText = ({ text }) => {
  const textRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflow(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <p
      ref={textRef}
      className={`${isOverflow ? style.scrollable : ""}`}
      title={text} // نمایش کامل متن روی hover
    >
      {text}
    </p>
  );
};

export default function Members() {
  // --- State های اصلی ---
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State برای صفحه‌بندی ---
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  // --- State برای مرتب‌سازی ---
  const [sortBy, setSortBy] = useState("last_name-asc");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- State های جدید برای منطق حذف ---
  const [isBoxopen, setisBoxopen] = useState(false);
  const [isBoxloading, setisboxloading] = useState(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState(null);

  // --- Ref ها برای مدیریت وضعیت‌های داخلی ---
  const isInitialMount = useRef(true);
  const isLoadingMore = useRef(false);
  const scrollContainerRef = useRef(null);

  // --- تابع اصلی دریافت لیست اعضا از سرور ---
  const fetchMembers = useCallback(async (currentPage, isNewSort) => {
    if (isLoadingMore.current && !isNewSort) return;

    setLoading(true);
    if (isNewSort) {
      setMembers([]);
    } else {
      isLoadingMore.current = true;
    }

    try {
      const [sortField, sortDir] = sortBy.split('-');
      const response = await api.get(endpoints.employments(currentPage, sortField, sortDir));
      const responseData = response.data;
      const newMembers = Array.isArray(responseData.data) ? responseData.data : [];

      setMembers(prevMembers => isNewSort ? newMembers : [...prevMembers, ...newMembers]);
      setHasNextPage(responseData.links?.next !== null);
      setError(null);

    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
      if (serverMessage) {
        setError(`پیام سرور: ${serverMessage}`);
      } else if (err.request) {
        setError("خطای شبکه: پاسخی از سرور دریافت نشد.");
      } else {
        setError(`خطای ناشناخته در تنظیم درخواست: ${err.message}`);
      }
    } finally {
      setLoading(false);
      isLoadingMore.current = false;
    }
  }, [sortBy]);

  // Effect 1: بارگذاری اولیه داده‌ها
  useEffect(() => {
    fetchMembers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect 2: رسیدگی به تغییر مرتب‌سازی
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    setHasNextPage(true);
    fetchMembers(1, true);
  }, [sortBy, fetchMembers]);

  // Effect 3: بارگذاری صفحات بعدی هنگام تغییر state صفحه
  useEffect(() => {
    if (page > 1) {
      fetchMembers(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // --- مدیریت اسکرول و بارگذاری بیشتر ---
  const handleScroll = useCallback(() => {
    if (isLoadingMore.current || !hasNextPage) return;
    const container = scrollContainerRef.current;
    if (container) {
      const threshold = 100;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [hasNextPage]);

  // Effect 4: افزودن و حذف listener اسکرول
  useEffect(() => {
    const containerElement = scrollContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Effect 5: بارگذاری خودکار
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!loading && hasNextPage && !isLoadingMore.current && members.length > 0 && container) {
      const canScroll = container.scrollHeight > container.clientHeight;
      if (!canScroll) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [loading, hasNextPage, members]);

  const handleDropdownToggle = (dropdownId) => {
    setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
  };

  // ======================= [شروع] منطق کامل حذف =======================
  const handleDelete = (memberId) => {
    setMemberIdToDelete(memberId);
    setisBoxopen(true);
  };

  const handleCancelDelete = () => {
    setisBoxopen(false);
    setMemberIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!memberIdToDelete) return;
    setisboxloading(true);
    try {
      // فرض بر این است که اندپوینت employments برای حذف یک عضو نیز استفاده می‌شود
      await api.delete(endpoints.deleteemployment(memberIdToDelete));
      fetchMembers(1, true); // بارگذاری مجدد لیست پس از حذف
    } catch (err) {
      console.error("خطا در حذف عضو:", err);
      setError("عملیات حذف با خطا مواجه شد.");
    } finally {
      handleCancelDelete();
      setisboxloading(false);
    }
  };
  // ======================== [پایان] منطق کامل حذف ========================

  const handleEdit = (memberId) => {

    navigate(`/AddDeputy/${memberId}`);
  };


  const sortOptions = [
    { value: "last_name-asc", label: "نام خانوادگی (صعودی)" },
    { value: "last_name-desc", label: "نام خانوادگی (نزولی)" },
    { value: "personnel_code-asc", label: "کد پرسنلی (صعودی)" },
    { value: "personnel_code-desc", label: "کد پرسنلی (نزولی)" },
  ];


  const renderMemberRows = () => {
    if (loading && page === 1) {
      return Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} height={60} count={1} duration={2} highlightColor="#69b0b2" />
      ));
    }
    if (error) {
      return <div className={style.errorState}><p>{error}</p></div>;
    }
    if (members.length === 0 && !loading) {
      return <div className={style.emptyState}><p>عضوی یافت نشد.</p></div>;
    }
    return members.map(member => {
      const roles = member.user?.active_employments?.[0]?.roles;
      const translatedRoles = roles
        ? roles.map(role => roleTranslations[role] || role).join('، ')
        : '---';

      return (
        <div key={`${member.id}-${member.user?.national_code}`} className={style.row}>
          <div className={`${style.item} ${style.display}`}><p><ScrollableText text={member.user?.profile?.first_name || '---'} /></p></div>
          <div className={`${style.item} ${style.display}`}><p><ScrollableText text={member.user?.profile?.last_name || '---'} /></p></div>
          <div className={`${style.item} ${style.displaynone}`}><p><ScrollableText text={`${member.user?.profile?.first_name || '---'} ${member.user?.profile?.last_name}` || '---'} /></p></div>
          <div className={style.item}><p>{toPersianDigits(member.user?.profile?.national_code) || '---'}</p></div>
          <div className={`${style.item} ${style.display}`}><p><ScrollableText text={member.user?.active_employments[0]?.role?.code || '---'} /></p></div>
          <div
            className={`${style.delete} ${member.user?.active_employments[0]?.role?.code === "مدیر" ? style.roleerror : ``} ${user?.role?.name !== "principal" && user?.role?.name !== "admin" ? style.roleerror : ''
              }`}
            onClick={() => {
              if (user?.role?.name !== "principal" && user?.role?.name !== "admin") {
                showErrorNotification("شما دسترسی ندارید")

              } // اگر مدیر نیست، کاری نکن
              else {
                if (member.user?.active_employments[0]?.role?.code !== "مدیر") {
                  handleDelete(member.user.active_employments[0].id);
                }
              }

            }}

          >
            <img src={deleteIcon} alt="حذف" /><p>حذف</p>
          </div>

          <div
            className={`${style.edit} ${member.user?.active_employments[0]?.role?.code === "مدیر" ? style.roleerror : ``} ${user?.role?.name !== "principal" && user?.role?.name !== "admin" ? style.roleerror : ''
              }`}
            onClick={() => {
              if (user?.role?.name !== "principal" && user?.role?.name !== "admin") {
                showErrorNotification("شما دسترسی ندارید");
              }   // اگر مدیر نیست، کاری نکن
              else {
                if (member.user?.active_employments[0]?.role?.code !== "مدیر") {
                  handleEdit(member.user.profile?.deputy_details?.id);
                }

              }

            }}

          >
            <img src={editIcon} alt="ویرایش" /><p>ویرایش</p>
          </div>

        </div>
      );
    });
  };

  return (
    <div className={style.container}>
      {/* مودال تایید حذف در اینجا رندر می‌شود */}
      {isBoxopen && <QuestionBox message={"آیا از حذف این عضو اطمینان دارید؟"} onConfirm={handleConfirmDelete} isLoading={isBoxloading} onCancel={handleCancelDelete} />}

      <div className={style.header}>
        <div className={style.right}>
          <img src={iconmembers} alt="" />
          <h1>کادر آموزشگاه</h1>
        </div>
        <div className={style.left}>
          <Dropdown
            options={sortOptions}
            defualt={"نام خانوادگی (صعودی)"}
            onSelect={(option) => setSortBy(option.value)}
            mobileBehavior="icon"
            isOpen={activeDropdown === 'members-sort'}
            onToggle={() => handleDropdownToggle('members-sort')}
          />
        </div>
      </div>

      <div ref={scrollContainerRef} className={style.table}>
        {renderMemberRows()}

        {loading && page > 1 && (
          <div className={style.loadingMore}>
            <p>در حال بارگذاری موارد بیشتر...</p>
            <LoadingSpinner />
          </div>
        )}

        {!hasNextPage && members.length > 0 && !loading && (
          <div className={style.endOfList}>
            <p>به انتهای لیست رسیدید.</p>
          </div>
        )}
      </div>
    </div>
  );
}