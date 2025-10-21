import style from "./Class.module.css";
import delete1 from "../../assets/icons/delete.svg";
import edit from "../../assets/icons/edit.svg";
import Laptop from "../../assets/icons/Laptop.svg";
import drop from "../../assets/icons/dropGreen.svg";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import React, { useState, useEffect, useRef } from "react";
import api, { endpoints } from "../../config/api";
import {
  showErrorNotification,
  showWarningNotification,
  showSuccessNotification,
} from "../../services/notificationService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import tic from "../../assets/icons/ticbutton.svg";

const Dropdown = ({ items, selected, isOpen, onToggle, onSelect }) => (
  <div className={style.customSelectWrapper} onClick={onToggle}>
    <div className={style.selectToggle}>
      <img
        src={drop}
        alt="arrow"
        className={`${style.selectArrow} ${isOpen ? style.open : ""}`}
      />
    </div>
    <div className={style.customSelectBox}>{selected?.name}</div>
    {isOpen && (
      <div className={style.selectDropdown}>
        {items.map((item) => (
          <div
          className={style.selectDropdownitem}
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function Class() {
  const [classes, setClasses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [grades, setGrades] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedClass, setEditedClass] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [majorRes, gradeRes, classRes] = await Promise.all([
          api.get(endpoints.getmajor()),
          api.get(endpoints.getgrade()),
          api.get(endpoints.classes()),
        ]);
        setMajors(majorRes.data.data);
        setGrades(gradeRes.data.data);
        setClasses(classRes.data.data);
      } catch (err) {
        console.error("خطا در بارگذاری:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRefs.current.every((ref) => ref && !ref.contains(e.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (index) => {
    if (editIndex !== null) return alert("ابتدا ویرایش را تکمیل کنید.");
    setEditIndex(index);
    setEditedClass({ ...classes[index], isNew: classes[index]?.isNew || false });
  };

  const handleCancelEdit = () => {
    if (editedClass?.isNew) {
      setClasses((prev) => prev.filter((_, i) => i !== editIndex));
    }
    setEditIndex(null);
    setEditedClass(null);
  };

  const handleSave = async (index) => {
  if (!editedClass.name.trim() || !editedClass.capacity) {
    return alert("نام و ظرفیت الزامی است.");
  }

  setIsSaving(true); // شروع لودینگ
  try {
    if (editedClass.isNew) {
      const payload = {
        name: editedClass.name,
        grade_level_id: editedClass.grade_level.id,
        field_of_study_id: editedClass.field_of_study.id,
        capacity: parseInt(editedClass.capacity),
      };
      const res = await api.post(endpoints.classes(), payload);
      const updatedClasses = [...classes];
      updatedClasses[index] = {
        ...editedClass,
        id: res.data.data.id,
        isNew: false,
      };
      setClasses(updatedClasses);
      showSuccessNotification(res.data.message);
    } else {
      const payload = {
        name: editedClass.name,
        capacity: parseInt(editedClass.capacity),
      };
      await api.put(`${endpoints.updateclass(editedClass.id)}`, payload);
      const updatedClasses = [...classes];
      updatedClasses[index] = {
        ...classes[index],
        name: editedClass.name,
        capacity: parseInt(editedClass.capacity),
      };
      setClasses(updatedClasses);
    }

    setEditIndex(null);
    setEditedClass(null);
  } catch (err) {
    const errors = err?.response?.data?.errors?.capacity;
    if (errors) {
      errors.forEach((e) => showWarningNotification(e));
    } else {
      showErrorNotification("خطا در ذخیره‌سازی");
    }
  } finally {
    setIsSaving(false); // پایان لودینگ
  }
};


  const handleAddClass = () => {
    if (editIndex !== null) return showWarningNotification("ابتدا ویرایش را تکمیل کنید.");
    if (!grades.length || !majors.length) return showWarningNotification("خطا در دریاغت اطلاعات(نبود پایه)");

    const newClass = {
      name: "",
      grade_level: grades[0],
      field_of_study: majors[0],
      capacity: "",
      isNew: true,
      id: `new-${Date.now()}`,
    };

    setClasses((prev) => [newClass, ...prev]);
    setEditIndex(0);
    setEditedClass(newClass);
  };

 const handleDelete = async (index) => {
  const cls = classes[index];

  if (cls.isNew) {
    const updated = [...classes];
    updated.splice(index, 1);
    setClasses(updated);
    if (editIndex === index) {
      setEditIndex(null);
      setEditedClass(null);
    }
    return;
  }

  if (window.confirm("آیا از حذف این کلاس مطمئن هستید؟")) {
    setIsDeleting(cls.id); // شروع لودینگ حذف
    try {
      await api.delete(`${endpoints.updateclass(cls.id)}`);
      setClasses((prev) => prev.filter((_, idx) => idx !== index));
      showSuccessNotification("کلاس با موفقیت حذف شد");
    } catch (err) {
      showErrorNotification(err?.response?.data?.message || "خطا در حذف کلاس");
    } finally {
      setIsDeleting(null); // پایان لودینگ
    }
  }
};


  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.right}>
          <img src={Laptop} alt="" />
          <h1>لیست کلاس‌های مدرسه شما</h1>
        </div>
        <button className={style.button} onClick={handleAddClass}>
          افزودن کلاس جدید
        </button>
      </div>

      <div className={style.title}>
        <div className={style.itemcontainer}>
          <div className={style.item1}><p>نام کلاس</p></div>
          <div className={style.item1}><p>پایه</p></div>
          <div className={style.item1}><p className={style.textShort}>رشته</p></div>
          <div className={style.item1}><p>ظرفیت</p></div>
        </div>
      </div>

      <div className={style.table}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className={style.row} key={i} height={50} borderRadius={8}  highlightColor="#69b0b2" />
          ))
        ) : classes.length === 0 ? (
          <p className={style.noClassMessage}>کلاسی موجود نیست</p>
        ) : (
          classes.map((cls, i) => (
            <div className={style.row} key={cls.id}>
              <div className={`${style.item} ${editIndex === i ? style.editingItem : ""}`}>
  {editIndex === i ? (
                  <input
                    placeholder="نام کلاس را وارد کنید"
                    value={editedClass.name}
                    className={style.input}
                    onChange={(e) =>
                      setEditedClass({ ...editedClass, name: e.target.value })
                    }
                  />
                ) : (
                  <p>{cls.name}</p>
                )}
              </div>

              <div className={`${style.item} ${style.display}`} ref={(el) => (dropdownRefs.current[i] = el)}>
                {editIndex === i ? (
                  <Dropdown
                    items={grades}
                    selected={editedClass.grade_level}
                    isOpen={openDropdown === `grade-${i}`}
                    onToggle={() =>
                      setOpenDropdown(openDropdown === `grade-${i}` ? null : `grade-${i}`)
                    }
                    onSelect={(val) => {
                      setEditedClass({ ...editedClass, grade_level: val });
                      setOpenDropdown(null);
                    }}
                  />
                ) : (
                  <div className={`${style.customSelectWrapper} ${style.notEditable}`}>
                    <div className={style.customSelectBox}>{cls.grade_level?.name}</div>
                  </div>
                )}
              </div>

              <div className={style.item} ref={(el) => (dropdownRefs.current[i + classes.length] = el)}>
                {editIndex === i ? (
                  <Dropdown
                    items={majors}
                    selected={editedClass.field_of_study}
                    isOpen={openDropdown === `major-${i}`}
                    onToggle={() =>
                      setOpenDropdown(openDropdown === `major-${i}` ? null : `major-${i}`)
                    }
                    onSelect={(val) => {
                      setEditedClass({ ...editedClass, field_of_study: val });
                      setOpenDropdown(null);
                    }}
                  />
                ) : (
                  <div className={`${style.customSelectWrapper} ${style.notEditable}`}>
                    <div className={style.customSelectBox}>{cls.field_of_study?.name ? cls.field_of_study?.name : '--------'}</div>
                  </div>
                )}
              </div>

              <div className={`${style.item} ${editIndex === i ? style.editingItem : ""}`}>
  {editIndex === i ? (
                  <input
                    className={style.input}
                    type="number"
                    value={editedClass.capacity}
                    onChange={(e) =>
                      setEditedClass({ ...editedClass, capacity: e.target.value })
                    }
                    placeholder="ظرفیت کلاس را وارد کنید"
                  />
                ) : (
                  <p>{cls.capacity}</p>
                )}
              </div>

              <div
  className={`${style.delete} ${editIndex === i ? style.disabled : ""}`}
  onClick={() => {
    if (editIndex === i) {
      handleCancelEdit();
    } else {
      handleDelete(i);
    }
  }}
>
  {isDeleting === cls.id ? (
    <LoadingSpinner />   // لودینگ به‌جای متن و آیکون
  ) : (
    <>
      <img src={delete1} alt="delete/cancel" />
      <p>{editIndex === i ? "انصراف" : "حذف"}</p>
    </>
  )}
</div>


              <div className={`${style.edit} ${style.display}`}>
  {editIndex === i ? (
    <button className={style.button2} onClick={() => handleSave(i)} disabled={isSaving}>
      {isSaving ? (
        <LoadingSpinner />  // نمایش اسپینر
      ) : (
        <>
          <img src={tic} alt="save" />
          <p>تایید</p>
        </>
      )}
    </button>
  ) : (
    <button className={style.button2} onClick={() => handleEdit(i)}>
      <img src={edit} alt="edit" />
      <p>ویرایش</p>
    </button>
  )}
</div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
