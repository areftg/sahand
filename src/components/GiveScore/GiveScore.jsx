import React, { useState, useRef, useEffect, useMemo } from "react";
import style from "./GiveScore.module.css";
import Dropdown from "../DropDown/DropDown";
import ScoreFormat from "../../utils/ScoreFormat"; // نام این فایل را مطابق پروژه خودتان تنظیم کنید
import api, { endpoints } from "../../config/api";
import drop from "../../assets/icons/Drop.svg";
import { showSuccessNotification, showErrorNotification, showWarningNotification } from "../../services/notificationService";

// useAuth component (بدون تغییر)
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

// StudentList component (تغییر یافته)
const StudentList = ({
    label = "انتخاب وضعیت",
    teacherSchedule,
    currentSelectedClass,
    onClassSelect,
    isLoadingSchedule,
    scoreCategories,
    isLoadingCategories,
    students,
    selected,
    headerSelected,
    onStudentSelect,
    onHeaderSelect,
    studentScores,
    onScoreChange,
}) => {
    const [open, setOpen] = useState(null);
    const dropdownRef = useRef(null);
    return (
        <div className={style.StudentList}>
            <div className={style.header}>
                <div className={style.right}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.21723 0.266602C6.0644 0.266602 5.12711 1.18476 5.12711 2.31406C5.12711 3.44336 6.0644 4.36152 7.21723 4.36152C8.37006 4.36152 9.30734 3.44336 9.30734 2.31406C9.30734 1.18476 8.37006 0.266602 7.21723 0.266602ZM2.27933 4.74542C2.03766 4.77741 1.82865 4.95017 1.70455 5.25728L0.189214 10.0944C0.0226577 10.5871 0.267593 11.0861 0.685616 11.1693L1.70455 11.3997C2.12257 11.4828 2.53406 11.2525 2.61897 10.7598L3.79466 5.84593C3.87957 5.43644 3.61178 5.00775 3.19375 4.92457L2.54059 4.77101C2.45568 4.75182 2.36097 4.73582 2.27933 4.74542ZM5.28387 5.1805C4.86585 5.1805 4.70909 5.66678 4.70909 5.66678C4.37598 7.05841 3.53993 10.7534 3.45502 11.2461C3.28846 12.0651 3.69669 12.7209 4.0298 13.2936C4.36291 13.7862 8.38312 20.0054 8.9677 20.7412C9.47063 21.397 9.96703 21.7137 10.7182 21.3043C11.3027 20.9779 11.2342 20.1622 10.9011 19.5895C10.5679 19.0169 6.45956 12.4746 6.45956 12.4746L7.29561 9.60814C7.29561 9.60814 7.80181 10.248 8.05327 10.6575C8.13818 10.8206 8.29494 10.9038 8.62805 11.067C9.04608 11.2301 9.9801 11.8188 10.483 12.0651C10.986 12.3114 11.564 12.3786 11.8155 11.8859C12.0669 11.4764 11.7371 10.9998 11.3191 10.8366C10.9011 10.6735 9.15058 9.60814 9.15058 9.60814C9.15058 9.60814 8.21656 7.63106 7.71363 6.48576C7.2107 5.50362 6.89391 5.1805 6.22442 5.1805H5.28387ZM17.6678 5.99949C16.7436 5.99949 15.9957 6.7321 15.9957 7.63746C15.9957 8.54282 16.7436 9.27542 17.6678 9.27542C18.592 9.27542 19.3399 8.54282 19.3399 7.63746C19.3399 6.7321 18.592 5.99949 17.6678 5.99949ZM14.402 9.3522C14.1505 9.3522 13.9121 9.51536 13.8272 9.7617L12.7299 13.2936C12.5633 13.6199 12.7364 13.9526 13.0695 14.0358L13.9056 14.1893C14.1571 14.2725 14.5 14.0262 14.5849 13.7798L15.4209 10.1712C15.5058 9.84487 15.2544 9.61454 15.0029 9.53136L14.402 9.3522ZM16.257 10.0944C15.9239 10.0944 15.839 10.4271 15.839 10.4271C15.5875 11.4093 15.0878 13.6263 15.0029 14.0358C14.918 14.6916 15.1695 15.0851 15.4209 15.4946C15.6724 15.8209 18.5822 20.4021 19.0003 20.8948C19.4183 21.3874 19.7514 21.6306 20.2543 21.3043C20.6723 21.0579 20.6887 20.4853 20.4372 20.0758C20.1857 19.6663 17.1714 14.9315 17.1714 14.9315L17.6678 13.2936L18.1642 14.0358C18.2491 14.1989 18.3308 14.1797 18.5822 14.3429C18.8337 14.506 19.9147 14.9987 20.3327 15.1619C20.6658 15.325 21.1851 15.4114 21.3516 15.0851C21.6031 14.7588 21.4235 14.4293 21.0904 14.2661L19.0786 13.2936C19.0786 13.2936 18.4255 11.8028 18.0074 11.067C17.6743 10.3311 17.4131 10.0944 16.9101 10.0944H16.257ZM3.37664 14.3429L2.69735 16.6463C2.69735 16.6463 0.953413 19.1128 0.450478 19.7687C0.117366 20.2613 -0.219011 20.914 0.450478 21.4066C1.11997 21.8993 1.71108 21.2275 2.04419 20.818C2.3773 20.4917 3.71628 18.6234 4.13431 18.1307C4.38577 17.8044 4.5458 17.558 4.63071 17.3117C4.71562 17.1485 4.8038 16.979 4.97035 16.5695L3.37664 14.3429ZM15.0813 16.16L14.5849 17.8748C14.5849 17.8748 13.3243 19.6855 12.9912 20.1781C12.7397 20.5876 12.4882 20.9779 12.9912 21.3043C13.4941 21.7137 13.9154 21.2211 14.1669 20.8948C14.4183 20.6484 15.4046 19.276 15.6561 18.9497C15.8226 18.7033 15.9108 18.5242 15.9957 18.361C16.0806 18.1979 16.1721 18.0475 16.257 17.7212L15.0813 16.16Z" fill="white" />
                    </svg>
                    <h1>لیست دانش آموزان</h1>
                    <p>{Object.values(selected).filter((s) => s === "غایب").length} نفر غایب هستند.</p>
                </div>
                <div className={style.left}>
                    {isLoadingSchedule ? (
                        <div className={style.dropdownEmpty}>در حال بارگذاری برنامه...</div>
                    ) : teacherSchedule.length > 0 ? (
                        <Dropdown
                            options={teacherSchedule.map((c) => ({ value: c.schedule_id, label: c.name }))}
                            defualt={currentSelectedClass ? currentSelectedClass.name : "انتخاب کلاس از برنامه"}
                            onSelect={onClassSelect}
                        />
                    ) : (
                        <div className={style.dropdownEmpty}>کلاسی برای امروز یافت نشد</div>
                    )}
                    {isLoadingCategories ? (<div className={style.dropdownEmpty}>...</div>) : scoreCategories.length > 0 ? (
                        <Dropdown options={scoreCategories} defualt="انتخاب دسته نمره" onSelect={(option) => onHeaderSelect(option.value)} />
                    ) : (
                        <div className={style.dropdownEmpty}>هیچ موردی یافت نشد</div>
                    )}
                </div>
            </div>
            <div className={style.table}>
                {students.map((st, index) => {
                    // ** منطق جدید برای نمایش نمره صحیح **
                    // پیدا کردن دسته‌بندی فعلی انتخاب شده برای این دانش‌آموز
                    const effectiveCategoryId = selected[st.enrollment_id] ?? headerSelected;
                    // پیدا کردن نمره متناظر با دسته‌بندی فعلی از استیت جدید نمرات
                    const currentScore = (studentScores[st.enrollment_id] && studentScores[st.enrollment_id][effectiveCategoryId]) || '';

                    return (
                        <div className={style.row} key={st.enrollment_id}>
                            <div className={` ${style.item} ${style.displaynone}`}>{index + 1}</div>
                            <div className={` ${style.item} ${style.displaynone}`}><p>{st.first_name}</p></div>
                            <div className={` ${style.item} ${style.displaynone}`}><p>{st.last_name}</p></div>
                            <div className={` ${style.item} ${style.displayon}`}><p>{st.full_name}</p></div>
                            <div className={`${style.item} ${style.display}`} ref={dropdownRef}>
                                <div className={style.dropdownFlesh} onClick={() => setOpen(open === st.enrollment_id ? null : st.enrollment_id)}>
                                    <img className={`${style.open} ${open === st.enrollment_id ? style.rotated : ""}`} src={drop} alt="" />
                                </div>
                                <div className={style.dropdownText} onClick={() => setOpen(open === st.enrollment_id ? null : st.enrollment_id)}>
                                    <p className={style.label}>
                                        {scoreCategories.find(item => item.value === effectiveCategoryId)?.label || label}
                                    </p>
                                </div>
                                {open === st.enrollment_id && (
                                    <div className={style.dropdownMenu}>
                                        <ul className={style.dropdownList}>
                                            {scoreCategories.length > 0 ? (
                                                scoreCategories.map((item) => (
                                                    <li key={item.value} className={style.dropdownItem} onClick={() => { onStudentSelect(st.enrollment_id, item); setOpen(null); }}>{item.label}</li>
                                                ))
                                            ) : (<li className={style.dropdownItemDisabled}>هیچ موردی یافت نشد</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className={style.item}>
                                <ScoreFormat
                                    className={style.input1}
                                    value={currentScore} // ** نمایش نمره داینامیک **
                                    onChange={(e) => onScoreChange(st.enrollment_id, e.target.value)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// SearchBarMobile component (بدون تغییر)
const SearchBarMobile = ({
    categories,
    isLoadingCategories,
    teacherSchedule,
    isLoadingSchedule,
    onCategorySelect,
    onClassSelect,
    currentSelectedClass,
    onSendScores,
    searchQuery,
    onSearchChange
}) => {
    const [isFirstDropdownOpen, setIsFirstDropdownOpen] = useState(false);
    const [selectedFirstOption, setSelectedFirstOption] = useState("دسته بندی نمرات");
    const [isSecondDropdownOpen, setIsSecondDropdownOpen] = useState(false);
    const handleFirstOptionClick = (option) => {
        setSelectedFirstOption(option.label);
        setIsFirstDropdownOpen(false);
        onCategorySelect(option.value);
    };
    const handleSecondOptionClick = (classItem) => {
        setIsSecondDropdownOpen(false);
        onClassSelect({ value: classItem.schedule_id, label: classItem.name });
    };
    return (
        <div className={style.SearchBar1}>
            <div className={style.SearchContainer}>
                <div className={style.Search}>
                    <input
                        className={style.input}
                        placeholder="جستجوی دانش‌آموز..."
                        type="text"
                        value={searchQuery}
                        onChange={onSearchChange}
                    />
                </div>
                <button className={style.button} onClick={onSendScores}>ثبت نمرات</button>
            </div>

            <div className={style.dropdownsContainer}>
                <div className={style.dropdown}>
                    <button onClick={() => { setIsFirstDropdownOpen(!isFirstDropdownOpen); setIsSecondDropdownOpen(false); }} className={style.dropdownButton}>
                        <img src={drop} alt="icon" className={`${style.icon} ${isFirstDropdownOpen ? style.rotated : ""}`} />
                        {selectedFirstOption}
                    </button>
                    {isFirstDropdownOpen && (
                        <ul className={style.dropdownMenu}>
                            {isLoadingCategories ? (<li className={style.dropdownItemDisabled}>...</li>) : categories.length > 0 ? (
                                categories.map((option) => (
                                    <li key={option.value} className={style.dropdownItem} onClick={() => handleFirstOptionClick(option)}>
                                        {option.label}
                                    </li>
                                ))
                            ) : (<li className={style.dropdownItemDisabled}>موردی یافت نشد</li>)}
                        </ul>
                    )}
                </div>
                <div className={style.dropdown}>
                    <button onClick={() => { setIsSecondDropdownOpen(!isSecondDropdownOpen); setIsFirstDropdownOpen(false); }} className={style.dropdownButton}>
                        <img src={drop} alt="icon" className={`${style.icon} ${isSecondDropdownOpen ? style.rotated : ""}`} />
                        {currentSelectedClass ? currentSelectedClass.name : "یک کلاس انتخاب کنید"}
                    </button>
                    {isSecondDropdownOpen && (
                        <ul className={style.dropdownMenu}>
                            {isLoadingSchedule ? (
                                <li className={style.dropdownItemDisabled}>در حال بارگذاری...</li>
                            ) : teacherSchedule && teacherSchedule.length > 0 ? (
                                teacherSchedule.map((classItem) => (
                                    <li key={classItem.schedule_id} className={style.dropdownItem} onClick={() => handleSecondOptionClick(classItem)}>
                                        {classItem.name}
                                    </li>
                                ))
                            ) : (
                                <li className={style.dropdownItemDisabled}>کلاسی یافت نشد</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            <div className={style.submit}><div className={style.submitbutton} onClick={onSendScores}>ثبت نمرات</div></div>
        </div>
    );
};

// Main GiveScore component (تغییرات اصلی اینجا هستند)
export default function GiveScore() {
    const [teacherScheduleClasses, setTeacherScheduleClasses] = useState([]);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [scoreCategories, setScoreCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selected, setSelected] = useState({});
    const [headerSelected, setHeaderSelected] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // ## تغییر ۱: ساختار استیت نمرات برای پشتیبانی از چند نمره برای هر دانش‌آموز ##
    // ساختار جدید: { enrollment_id: { category_id: score } }
    // مثال: { 146: { 1: "20", 2: "18.5" }, 147: { 1: "12" } }
    const [studentScores, setStudentScores] = useState({});

    useEffect(() => {
        const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
        const jsDayOfWeek = new Date().getDay();
        const todayPersianName = dayNames[jsDayOfWeek];
        const dayid = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;
        setIsLoadingSchedule(true);
        api.get(endpoints.teacherschdule(dayid)).then((res) => {
            const data = res.data;
            if (data?.status && typeof data.data === 'object' && data.data !== null) {
                const todaySchedule = data.data[todayPersianName];
                if (Array.isArray(todaySchedule) && todaySchedule.length > 0) {
                    const formattedSchedule = todaySchedule.map(item => ({
                        name: `${item.class_name} - ${item.course_name} (${item.start_time} - ${item.end_time})`,
                        ...item
                    }));
                    setTeacherScheduleClasses(formattedSchedule);
                    if (formattedSchedule.length > 0) {
                        setSelectedClass(formattedSchedule[0]);
                    }
                } else { setTeacherScheduleClasses([]); }
            } else { setTeacherScheduleClasses([]); }
        }).catch((err) => {
            
            setTeacherScheduleClasses([]);
        }).finally(() => { setIsLoadingSchedule(false); });
    }, []);

   useEffect(() => {
        setIsLoadingCategories(true);
        api.get(endpoints.getScoreCategory()).then((res) => {
            const data = res.data;
            if (data?.status && Array.isArray(data.data)) {
                
                // *** شروع تغییر ***
                // دسته‌بندی‌ها را بر اساس id مرتب‌سازی می‌کنیم
                const sortedData = data.data.sort((a, b) => a.id - b.id);
                // *** پایان تغییر ***

                const formattedCategories = sortedData.map((item) => ({ value: item.id, label: `${item.title} (${item.grade_category?.name || ""})` }));
                setScoreCategories(formattedCategories);
                if (formattedCategories.length > 0) {
                    setHeaderSelected(formattedCategories[0].value);
                }
            } else {
                setScoreCategories([]);
            }
        }).catch((err) => {
         
            setScoreCategories([]);
        }).finally(() => { setIsLoadingCategories(false); });
    }, []);

    // ## تغییر ۲: منطق جدید برای پردازش تمام نمرات دانش‌آموزان از سرور ##
    // ## تغییر ۲: منطق اصلاح شده برای پردازش نمرات ##
    useEffect(() => {
        if (selectedClass?.schedule_id) {
            const endpoint = endpoints.getscore(selectedClass.schedule_id);
            setStudents([]);
            setFilteredStudents([]);
            setStudentScores({});
            setSelected({}); // استیت انتخاب‌های دانش‌آموزان را ریست می‌کنیم

            api.get(endpoint).then((res) => {
                const data = res.data;
                if (data.status && Array.isArray(data.data?.students)) {
                    const studentsWithFullName = data.data.students.map(student => ({
                        ...student,
                        full_name: `${student.first_name || ''} ${student.last_name || ''}`
                    }));

                    const initialScores = {};
                    // ** شروع اصلاحات **
                    // دیگر نیازی به initialSelected نداریم

                    studentsWithFullName.forEach(student => {
                        initialScores[student.enrollment_id] = {}; // برای هر دانش‌آموز یک آبجکت برای نمراتش می‌سازیم

                        if (student.today_grades && student.today_grades.length > 0) {
                            // تمام نمرات دریافتی را در ساختار جدید ذخیره می‌کنیم
                            student.today_grades.forEach(grade => {
                                if (grade.gradebook_item_template) {
                                    initialScores[student.enrollment_id][grade.gradebook_item_template.id] = grade.points_earned.toString();
                                }
                            });
                        }
                    });
                    // ** پایان اصلاحات: دیگر initialSelected را مقداردهی نمی‌کنیم **

                    setStudents(studentsWithFullName);
                    setFilteredStudents(studentsWithFullName);
                    setStudentScores(initialScores);
                    // setSelected({}); // این خط در ابتدای هوک قرار گرفت

                } else {
                    setStudents([]);
                    setFilteredStudents([]);
                }
            }).catch((err) => {
                console.error("خطا در گرفتن لیست دانش‌آموزان:", err);
                setStudents([]);
                setFilteredStudents([]);
            });
        } else {
            setStudents([]);
            setFilteredStudents([]);
            setStudentScores({});
            setSelected({});
        }
    }, [selectedClass]);

    useEffect(() => {
        if (searchQuery === "") {
            setFilteredStudents(students);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = students.filter(student =>
                student.full_name.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredStudents(filtered);
        }
    }, [searchQuery, students]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // ## تغییر ۳: منطق جدید برای آپدیت نمره بر اساس دسته‌بندی انتخاب‌شده ##
    const handleScoreChange = (enrollmentId, score) => {
        // پیدا کردن دسته‌بندی‌ای که در حال حاضر برای دانش‌آموز انتخاب شده
        const categoryId = selected[enrollmentId] ?? headerSelected;

        if (!categoryId) {
          showWarningNotification("هیچ دسته‌بندی برای ثبت نمره انتخاب نشده است.")
            return;
        }

        setStudentScores(prevScores => ({
            ...prevScores,
            [enrollmentId]: {
                ...prevScores[enrollmentId],
                [categoryId]: score
            }
        }));
    };

    const handleHeaderSelect = (categoryId) => {
        setHeaderSelected(categoryId);
        // وقتی دسته‌بندی هدر تغییر می‌کند، دسته‌بندی تمام دانش‌آموزانی
        // که دسته‌بندی شخصی‌سازی شده ندارند را آپدیت می‌کنیم.
        const newSelected = { ...selected };
        students.forEach(st => {
            if (!selected[st.enrollment_id]) {
                newSelected[st.enrollment_id] = categoryId;
            }
        });
        setSelected(newSelected);
    };

    // ## تغییر ۴: منطق جدید برای ارسال تمام نمرات ثبت‌شده به سرور ##
    const handleSendScores = async () => {
        if (!selectedClass || !selectedClass.schedule_id) {
            showWarningNotification("لطفاً ابتدا یک کلاس را انتخاب کنید.")
            return;
        }

        const gradesPayload = [];
        // روی آبجکت نمرات پیمایش می‌کنیم تا تمام نمرات وارد شده را پیدا کنیم
        Object.keys(studentScores).forEach(enrollmentId => {
            const studentCategoryScores = studentScores[enrollmentId];
            Object.keys(studentCategoryScores).forEach(categoryId => {
                const scoreValue = studentCategoryScores[categoryId];
                // فقط نمراتی که معتبر هستند را ارسال می‌کنیم
                if (scoreValue !== '' && scoreValue !== null && scoreValue !== undefined) {
                    const score = parseFloat(scoreValue);
                    if (!isNaN(score)) {
                        gradesPayload.push({
                            enrollment_id: parseInt(enrollmentId, 10),
                            gradebook_item_template_id: parseInt(categoryId, 10),
                            points_earned: score
                        });
                    }
                }
            });
        });

        if (gradesPayload.length === 0) {
           showErrorNotification("هیچ نمره‌ی جدید یا ویرایش‌شده‌ای برای ثبت وجود ندارد.");
            return;
        }

        const finalPayload = {
            class_schedule_id: selectedClass.schedule_id,
            grades: gradesPayload
        };

        try {
         
            const response = await api.post(endpoints.sendScore(), finalPayload);
            if (response.data && response.data.status) {
                showSuccessNotification("نمرات با موفقیت ثبت شد!");
            } else {
                showWarningNotification(`خطا در ثبت نمرات: ${response.data.message || 'مشکلی پیش آمد.'}`);
            }
        } catch (error) {
            console.error("Error sending scores:", error);
            showErrorNotification("خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.")
        }
    };

    const handleClassSelect = (option) => {
        const newSelectedClass = teacherScheduleClasses.find((c) => c.schedule_id === option.value);
        setSelectedClass(newSelectedClass);
        setSearchQuery("");
    };

    const handleStudentSelect = (studentId, item) => {
        setSelected((prev) => ({ ...prev, [studentId]: item.value }));
    };

    const SearchBar = ({ onSendScores, searchQuery, onSearchChange }) => (
        <div className={style.SearchBar}>
            <div className={style.SearchContainer}>
                <div className={style.Search}>
                    <input
                        className={style.input}
                        placeholder="جستجوی دانش‌آموز..."
                        type="text"
                        value={searchQuery}
                        onChange={onSearchChange}
                    />
                </div>
                <button className={style.button} onClick={onSendScores}>ثبت نمرات</button>
            </div>
        </div>
    );

    return (
        <div className={style.GiveScore}>
            <SearchBar
                onSendScores={handleSendScores}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />
            <SearchBarMobile
                categories={scoreCategories}
                isLoadingCategories={isLoadingCategories}
                teacherSchedule={teacherScheduleClasses}
                isLoadingSchedule={isLoadingSchedule}
                userRole={user?.role}
                onCategorySelect={handleHeaderSelect}
                onClassSelect={handleClassSelect}
                currentSelectedClass={selectedClass}
                onSendScores={handleSendScores}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />
            <StudentList
                label="دسته بندی نمرات"
                teacherSchedule={teacherScheduleClasses}
                currentSelectedClass={selectedClass}
                onClassSelect={handleClassSelect}
                isLoadingSchedule={isLoadingSchedule}
                userRole={user?.role}
                scoreCategories={scoreCategories}
                isLoadingCategories={isLoadingCategories}
                students={filteredStudents}
                selected={selected}
                headerSelected={headerSelected}
                onStudentSelect={handleStudentSelect}
                onHeaderSelect={handleHeaderSelect}
                studentScores={studentScores}
                onScoreChange={handleScoreChange}
            />
        </div>
    );
}