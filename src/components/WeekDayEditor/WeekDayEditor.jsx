import styles from "./WeekDayEditor.module.css";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DownArrow from '../../assets/icons/Drop.svg';
import { useAlerts } from '../../Context/AlertContext';
import api, { endpoints } from "../../config/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { showSuccessNotification } from "../../services/notificationService"
import trash from "../../assets/icons/close.svg"

// کامپوننت آکاردئون برای نمایش خطاها
const ErrorAccordion = ({ title, generalMessage, errors = [] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const errorCount = errors.length;

    if (errorCount === 0 && !generalMessage) {
        return null;
    }

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className={styles.error}>
            <div className={styles.errorHeader} onClick={toggleOpen}>
                <span className={`${styles.errorArrow} ${isOpen ? styles.open : ''}`}></span>
                <span className={styles.errorTitle}>{title}</span>
                {errorCount > 0 && <span className={styles.errorCount}>{errorCount}</span>}
            </div>
            {isOpen && (
                <div className={styles.errorContent}>
                    <p>{generalMessage}</p>
                    {errors}
                </div>
            )}
        </div>
    );
};

// کامپوننت‌ Selector
const Selector = ({ isActive, onClick }) => {
    return (
        <div className={styles.selectorContainer}>
            <p>تک زنگ ؟</p>
            <div
                className={`${styles.selector} ${isActive ? styles.active : ''}`}
                onClick={onClick}
            ></div>
        </div>
    );
};

// کامپوننت Dropdown
const Dropdown = ({ options, onSelect, initialValue, onScrollBottom,clear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(initialValue);
     const listRef = useRef(null);
  const containerRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (value) => {
        setSelectedValue(value);
        setIsOpen(false);
        if (onSelect) onSelect(value);
    };

    const handleScroll = () => {
        const container = listRef.current;
        if (!container) return;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            if (onScrollBottom) onScrollBottom();
        }
    };
     const handleclear = () => {
         setSelectedValue(clear);
        setIsOpen(false);
        onSelect(null)
    };

      useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
    

    return (
        <div className={styles.dropdownContainer} ref={containerRef}>
            {clear && <div className={styles.dropdownclear} onClick={()=>{handleclear()}} ><img src={trash} /></div>}
            <div className={styles.dropdownHeader} onClick={toggleDropdown}>
                <span className={styles.selectedValue}>{selectedValue}</span>
                <img src={DownArrow} className={styles.dropdownArrow} alt="Dropdown arrow" />
            </div>
            {isOpen && (
                <div className={styles.dropdownList} ref={listRef} onScroll={handleScroll} >
                    {options.map((option, index) => (
                        <div key={index} className={styles.dropdownItem} onClick={() => handleSelect(option)}>
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};



export default function WeekDayEditor() {
    // بخش ۱: تعریف تمام State ها و هوک‌ها
    const { timeSlots, loading: periodsLoading, error: periodsError } = useAlerts();
    const [searchParams] = useSearchParams();
    const gradeIdFromUrl = searchParams.get('gradeId');

    const [apiGrades, setApiGrades] = useState([]);
    const [gradesLoading, setGradesLoading] = useState(true);
    const [gradesError, setGradesError] = useState(null);

    const [teachersError, setTeachersError] = useState(null);
    const [error, setError] = useState(null);

    const [teacherPage, setTeacherPage] = useState(1);
    const [hasMoreTeachers, setHasMoreTeachers] = useState(true);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [apiTeachers, setApiTeachers] = useState([]);


    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);

    const [apiCourses, setApiCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesError, setCoursesError] = useState(null);

    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isHalfBellActive, setIsHalfBellActive] = useState(false);
    const [allSchedules, setAllSchedules] = useState({});

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const [originalScheduleData, setOriginalScheduleData] = useState({});

    // بخش ۲: تمام useMemo ها
    const classPeriods = useMemo(() => {
        if (!timeSlots) return [];
        return timeSlots
            .filter(slot => slot.type === 'class_period')
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }, [timeSlots]);

    const allTeachers = useMemo(() => {
        if (!apiTeachers || apiTeachers.length === 0) return [];
        return apiTeachers.map(teacher =>
            `${teacher?.profile?.first_name} ${teacher?.profile?.last_name}`
        );
    }, [apiTeachers]);

    const scheduleLookupKey = useMemo(() => {
        if (!selectedClass) return null;
        const gradeName = selectedClass.name.replace('پایه ', '');
        const fieldName = "شبکه و نرم افزار رایانه";
        return `${gradeName} ${fieldName}`;
    }, [selectedClass]);

    const lessonOptions = useMemo(() => {
        if (!apiCourses) return [];
        return apiCourses.map(course => course.name);
    }, [apiCourses]);
    const scheduleRowStyle = useMemo(() => {
        const numPeriods = classPeriods.length;
        if (numPeriods === 0) {
            return { gridTemplateColumns: '1fr' };
        }
        return {
            gridTemplateColumns: `1fr repeat(${numPeriods}, 1.5fr)`
        };
    }, [classPeriods.length]);

    const dynamicUnselectedData = useMemo(() => {
        const requiredCoursesForClass = lessonOptions;
        const currentSchedule = allSchedules[scheduleLookupKey];

        if (!currentSchedule) {
            return { teachers: allTeachers, courses: requiredCoursesForClass };
        }

        const scheduledLessons = [];
        const scheduledTeachers = new Set();

        currentSchedule.forEach(dayRow => {
            dayRow.slice(1).forEach(cellContent => {
                if (!cellContent) return;
                const cells = Array.isArray(cellContent) ? cellContent : [cellContent];
                cells.forEach(cell => {
                    if (cell) {
                        scheduledLessons.push(cell.lesson);
                        scheduledTeachers.add(cell.teacher);
                    }
                });
            });
        });

        const unselectedTeachersList = allTeachers.filter(teacher => !scheduledTeachers.has(teacher));
        const unselectedCoursesList = [...requiredCoursesForClass];
        scheduledLessons.forEach(lesson => {
            const indexToRemove = unselectedCoursesList.indexOf(lesson);
            if (indexToRemove > -1) {
                unselectedCoursesList.splice(indexToRemove, 1);
            }
        });

        return { teachers: unselectedTeachersList, courses: unselectedCoursesList };
    }, [allSchedules, scheduleLookupKey, allTeachers, lessonOptions]);

    const classOptions = useMemo(() => apiGrades.map(grade => grade.name), [apiGrades]);

    const teacherNameToIdMap = useMemo(() => {
        const map = new Map();
        apiTeachers.forEach(teacher => {
            const fullName = `${teacher?.profile?.first_name} ${teacher?.profile?.last_name}`;
            map.set(fullName, teacher.id);
        });
        return map;
    }, [apiTeachers]);

    const courseNameToIdMap = useMemo(() => {
        const map = new Map();
        apiCourses.forEach(course => {
            map.set(course.name, course.id);
        });
        return map;
    }, [apiCourses]);

    const teacherIdToNameMap = useMemo(() => {
        const map = new Map();
        apiTeachers.forEach(teacher => {
            const fullName = `${teacher?.profile?.first_name} ${teacher?.profile?.last_name}`;
            map.set(teacher.id, fullName);
        });
        return map;
    }, [apiTeachers]);

    const courseIdToNameMap = useMemo(() => {
        const map = new Map();
        apiCourses.forEach(course => {
            map.set(course.id, course.name);
        });
        return map;
    }, [apiCourses]);

    // بخش ۳: تمام useEffect ها
    const fetchScheduleForClass = useCallback(async () => {
        if (!selectedClass || classPeriods.length === 0 || !scheduleLookupKey) {
            return;
        }

        setScheduleLoading(true);
        setScheduleError(null);
        const apiDayToFrontendIndex = { 6: 0, 7: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
        const timeSlotIdToIndex = classPeriods.reduce((acc, period, index) => {
            acc[period.id] = index + 1;
            return acc;
        }, {});

        try {
            const response = await api.get(endpoints.weekday(selectedClass.id));
            const scheduleByDay = response.data?.data?.schedule_by_day || [];

            const allEntriesForSaving = scheduleByDay.flatMap(day => day.entries);
            setOriginalScheduleData(prev => ({
                ...prev,
                [scheduleLookupKey]: allEntriesForSaving
            }));

            const initialDayTemplate = (dayName) => [dayName, ...Array(classPeriods.length).fill(null)];
            const newSchedule = [
                initialDayTemplate('شنبه'), initialDayTemplate('یکشنبه'), initialDayTemplate('دوشنبه'),
                initialDayTemplate('سه‌شنبه'), initialDayTemplate('چهارشنبه'),
            ];

            scheduleByDay.forEach(dayData => {
                const dayIndex = apiDayToFrontendIndex[dayData.day_of_week_id];
                if (dayIndex === undefined || dayIndex >= newSchedule.length) {
                    return;
                }

                dayData.entries.forEach(item => {
                    if (!item.course) {
                        return;
                    }

                    const timeIndex = timeSlotIdToIndex[item.time_slot_id];
                    if (timeIndex === undefined) {
                        return;
                    }

                    // ================= START OF MODIFICATION 1 =================
                    // FIX: Construct teacher name from first_name and last_name from the new structure
                    const teacherFullName = item.teacher ? `${item.teacher.first_name} ${item.teacher.last_name}` : '';

                    const cellContent = {
                        id: item.id,
                        lesson: item.course.name,
                        course_id: item.course.id,
                        teacher: teacherFullName,
                        teacher_id: item.teacher ? item.teacher.id : null // Assuming teacher object has an 'id'
                    };
                    // ================= END OF MODIFICATION 1 =================

                    if (item.division_type === 'full') {
                        newSchedule[dayIndex][timeIndex] = cellContent;
                    } else {
                        if (!Array.isArray(newSchedule[dayIndex][timeIndex])) {
                            newSchedule[dayIndex][timeIndex] = [null, null];
                        }

                        const halfIndex = item.division_type === 'first_half' ? 0 : 1;
                        newSchedule[dayIndex][timeIndex][halfIndex] = cellContent;
                    }
                });
            });

            setAllSchedules(prev => ({ ...prev, [scheduleLookupKey]: newSchedule }));

        } catch (err) {
            console.error("Failed to fetch or process schedule:", err);
            const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
            if (serverMessage) { setScheduleError(`پیام سرور: ${serverMessage}`); }
            else if (err.request) { setScheduleError("خطای شبکه: پاسخی از سرور دریافت نشد."); }
            else { setScheduleError(`خطای ناشناخته در تنظیم درخواست: ${err.message}`); }
        } finally {
            setScheduleLoading(false);
        }
    }, [selectedClass, classPeriods, scheduleLookupKey]);


const fetchTeachers = useCallback(async () => {
    if (teachersLoading || !hasMoreTeachers) return;
    setTeachersLoading(true);
    setTeachersError(null);

    try {
        const response = await api.get(endpoints.teacherslist(teacherPage));
        const teacherData = Array.isArray(response.data.data) ? response.data.data : [];

        if (teacherData.length === 0) {
            setHasMoreTeachers(false);
        } else {
            setApiTeachers(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const newUniqueTeachers = teacherData.filter(t => !existingIds.has(t.id));
                return [...prev, ...newUniqueTeachers];
            });
            setTeacherPage(prev => prev + 1);
        }
    } catch (err) {
        const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
        setTeachersError(serverMessage || "خطای نامشخص در دریافت معلمان");
    } finally {
        setTeachersLoading(false);
    }
}, [teachersLoading, hasMoreTeachers, teacherPage]);


    const teacherOptions = useMemo(() => {
        if (!apiTeachers) return [];
        return apiTeachers.map(teacher =>
            `${teacher?.profile?.first_name || ''} ${teacher?.profile?.last_name || ''}`
        );
    }, [apiTeachers]);


    useEffect(() => {
        fetchTeachers();
    }, []);


    useEffect(() => {
        const fetchGrades = async () => {
            setGradesLoading(true);
            setGradesError(null);
            try {
                const response = await api.get(endpoints.classes());
                const gradeData = Array.isArray(response.data.data) ? response.data.data : [];
                setApiGrades(gradeData);

                if (gradeData.length > 0) {
                    let classToSelect = null;
                    if (gradeIdFromUrl) {
                        classToSelect = gradeData.find(g => g.id === parseInt(gradeIdFromUrl, 10));
                    }
                    if (!classToSelect) {
                        classToSelect = gradeData[0];
                    }
                    setSelectedClass(classToSelect);
                }
            } catch (err) {
                const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
                if (serverMessage) { setGradesError(`پیام سرور: ${serverMessage}`); }
                else if (err.request) { setGradesError("خطای شبکه: پاسخی از سرور دریافت نشد."); }
                else { setGradesError(`خطای ناشناخته در تنظیم درخواست: ${err.message}`); }
            } finally {
                setGradesLoading(false);
            }
        };
        fetchGrades();
    }, [gradeIdFromUrl]);

    useEffect(() => {
        if (!selectedClass) return;
        const fetchCoursesForClass = async () => {
            setCoursesLoading(true);
            setCoursesError(null);
            setApiCourses([]);
            try {
                const response = await api.get(endpoints.courses(selectedClass.id));
                const coursesData = Array.isArray(response.data.data) ? response.data.data : [];
                setApiCourses(coursesData);
            } catch (err) {
                const serverMessage = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
                if (serverMessage) { setCoursesError(`پیام سرور: ${serverMessage}`); }
                else if (err.request) { setCoursesError("خطای شبکه: پاسخی از سرور دریافت نشد."); }
                else { setCoursesError(`خطای ناشناخته در تنظیم درخواست: ${err.message}`); }
            } finally {
                setCoursesLoading(false);
            }
        };
        fetchCoursesForClass();
    }, [selectedClass]);

    useEffect(() => {
        fetchScheduleForClass();
    }, [fetchScheduleForClass]);

    useEffect(() => {
        setSelectedLesson(null);
        setSelectedTeacher(null);
    }, [selectedClass]);

    // بخش ۴: متغیرها و هندلرها

    const currentSchedule = scheduleLookupKey ? allSchedules[scheduleLookupKey] : null;

    const handleClassSelect = (gradeName) => {
        const selectedGradeObject = apiGrades.find(g => g.name === gradeName);
        setSelectedClass(selectedGradeObject);
    };

    const handleCellClick = (dayIndex, timeIndex) => {
        
       if (!selectedLesson) {
    const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
    newSchedule[dayIndex][timeIndex] = null; // پاک کردن زنگ
    setAllSchedules(prev => ({ ...prev, [scheduleLookupKey]: newSchedule }));
    return;
}

        
        const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
        const cellData = { lesson: selectedLesson, teacher: selectedTeacher };
        const currentCell = newSchedule[dayIndex][timeIndex];
        if (currentCell && !Array.isArray(currentCell) && currentCell.lesson === selectedLesson && currentCell.teacher === selectedTeacher) {
            newSchedule[dayIndex][timeIndex] = null;
        } else if (isHalfBellActive) {
            if (!Array.isArray(currentCell)) {
                newSchedule[dayIndex][timeIndex] = [cellData, null];
            } else {
                newSchedule[dayIndex][timeIndex][0] = cellData;
            }
        } else {
            newSchedule[dayIndex][timeIndex] = cellData;
        }
        setAllSchedules(prev => ({ ...prev, [scheduleLookupKey]: newSchedule }));
    };

    const handleHalfBellClick = (e, dayIndex, timeIndex, halfIndex) => {
        e.stopPropagation();
        // ========== شروع تغییر ۲: حذف اجبار انتخاب معلم ==========
       if (!selectedLesson) {
    const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
    newSchedule[dayIndex][timeIndex] = null; // پاک کردن زنگ
    setAllSchedules(prev => ({ ...prev, [scheduleLookupKey]: newSchedule }));
    return;
}

        // ========== پایان تغییر ۲ ==========
        const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
        const cellData = { lesson: selectedLesson, teacher: selectedTeacher };
        let currentCell = newSchedule[dayIndex][timeIndex];
        if (!Array.isArray(currentCell)) {
            currentCell = [null, null];
        }
        if (currentCell[halfIndex] && currentCell[halfIndex].lesson === selectedLesson && currentCell[halfIndex].teacher === selectedTeacher) {
            currentCell[halfIndex] = null;
        } else {
            currentCell[halfIndex] = cellData;
        }
        if (currentCell[0] === null && currentCell[1] === null) {
            newSchedule[dayIndex][timeIndex] = null;
        } else {
            newSchedule[dayIndex][timeIndex] = currentCell;
        }
        setAllSchedules(prev => ({ ...prev, [scheduleLookupKey]: newSchedule }));
    };

    const toggleHalfBell = () => { setIsHalfBellActive(!isHalfBellActive); };

    const handleFinalSave = async () => {
        if (!currentSchedule || !selectedClass) {
            alert("جدول یا کلاس برای ذخیره سازی مشخص نیست.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setError(null);

        const frontendIndexToApiDay = { 0: 6, 1: 7, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
        const payloadSchedules = [];

        currentSchedule.forEach((dayRow, dayIndex) => {
            const dayOfWeekId = frontendIndexToApiDay[dayIndex];
            if (dayOfWeekId === undefined) return;

            dayRow.slice(1).forEach((cellContent, timeIndex) => {
                if (!cellContent) return;

                const processCell = (cell) => {
                    if (!cell) return;
                    const timeSlotId = classPeriods[timeIndex]?.id;
                    if (!timeSlotId) return;

                    const teacherId = cell.teacher_id || teacherNameToIdMap.get(cell.teacher);
                    const courseId = cell.course_id || courseNameToIdMap.get(cell.lesson);

                    // ========== شروع تغییر ۳: اختیاری کردن معلم در payload ارسالی ==========
                    if (courseId) { // شرط فقط برای وجود درس الزامی است
                        return {
                            id: cell.id || null,
                            time_slot_id: timeSlotId,
                            teacher_id: teacherId || null, // اگر معلمی نبود، null ارسال شود
                            course_id: courseId,
                            day_of_week_id: dayOfWeekId
                        };
                    }
                    // ========== پایان تغییر ۳ ==========
                    return null;
                };

                if (!Array.isArray(cellContent)) {
                    const scheduleItem = processCell(cellContent);
                    if (scheduleItem) {
                        payloadSchedules.push({ ...scheduleItem, division_type: 'full' });
                    }
                } else {
                    const [firstHalf, secondHalf] = cellContent;
                    const firstHalfItem = processCell(firstHalf);
                    if (firstHalfItem) {
                        payloadSchedules.push({ ...firstHalfItem, division_type: 'first_half' });
                    }
                    const secondHalfItem = processCell(secondHalf);
                    if (secondHalfItem) {
                        payloadSchedules.push({ ...secondHalfItem, division_type: 'second_half' });
                    }
                }
            });
        });

        const originalItems = originalScheduleData[scheduleLookupKey] || [];
        const originalIds = new Set(originalItems.map(item => item.id).filter(id => id != null));
        const currentIds = new Set();
        payloadSchedules.forEach(item => {
            if (item.id) {
                currentIds.add(item.id);
            }
        });

        const deleted_schedules = [...originalIds].filter(id => !currentIds.has(id));

        const payload = {
            schedules: payloadSchedules,
            deleted_schedules: deleted_schedules
        };

        try {
            await api.post(endpoints.saveSchedule(selectedClass.id), payload);
            showSuccessNotification("برنامه هفتگی با موفقیت ذخیره شد!");
            await fetchScheduleForClass();

        } catch (err) {
            const errorData = err.response?.data;
            if (errorData && errorData.errors && typeof errorData.errors === 'object') {
                const generalMessage = errorData.message || "لطفاً خطاهای زیر را بررسی کنید:";
                const apiDayToName = { 6: 'شنبه', 7: 'یکشنبه', 1: 'دوشنبه', 2: 'سه‌شنبه', 3: 'چهارشنبه', 4: 'پنجشنبه', 5: 'جمعه' };

                const errorDetails = Object.keys(errorData.errors).map(key => {
                    const match = key.match(/schedules\.(\d+)\./);
                    if (!match) {
                        return <div key={key} className={styles.errordiv}>{`${key}: ${errorData.errors[key].join(', ')}`}</div>;
                    }
                    const index = parseInt(match[1], 10);
                    const conflictingSchedule = payloadSchedules[index];
                    if (!conflictingSchedule) {
                        return <div key={key} className={styles.errordiv}>{`خطای ناشناس برای آیتم ${index} در برنامه.`}</div>;
                    }
                    const period = classPeriods.find(p => p.id === conflictingSchedule.time_slot_id);
                    const teacherName = teacherIdToNameMap.get(conflictingSchedule.teacher_id) || 'نامشخص';
                    const courseName = courseIdToNameMap.get(conflictingSchedule.course_id) || 'نامشخص';
                    const dayName = apiDayToName[conflictingSchedule.day_of_week_id] || 'روز نامشخص';
                    const serverErrorMessage = errorData.errors[key].join(', ');

                    return (
                        <div key={key} className={styles.errordiv}>
                            {`• تداخل در روز ${dayName}، ${period?.name || 'زنگ نامشخص'}: معلم (${teacherName}) برای درس (${courseName}).\n  ${serverErrorMessage}`}
                        </div>
                    );
                }).filter(Boolean);

                setError({
                    generalMessage: generalMessage,
                    details: errorDetails
                });

            } else {
                const serverMessage = errorData?.message || "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.";
                setError({
                    generalMessage: `خطا در ذخیره‌سازی: ${serverMessage}`,
                    details: []
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // بخش ۵: شرط‌های خروج زودهنگام
    if (periodsLoading || gradesLoading) { return (<> <div className={styles.container}> <div className={styles.Loading}> <LoadingSpinner /> <p>در حال بارگذاری اطلاعات اولیه...</p> </div> </div> <div className={styles.confooter}> <div className={styles.footer}> <h3>دبیرانی که تا کنون انتخاب نشده اند:</h3> <div className={styles.unselectedlist}> </div> </div> <div className={styles.footer}> <h3>دروسی که تاکنون انتخاب نشده اند:</h3> <div className={styles.unselectedlist}> </div> </div> </div> </>); }
    if (teachersError || gradesError || coursesError) { const errorMsg = teachersError || gradesError || coursesError; return (<div className={styles.container}> <div className={styles.error}> <p>خطا: {String(errorMsg)}</p> </div> </div>); }
    if (scheduleLoading || coursesLoading) { return (<> <div className={styles.container}> <div className={styles.Loading}> <LoadingSpinner /> <p>در حال دریافت اطلاعات کلاس...</p> </div> </div> <div className={styles.confooter}> <div className={styles.footer}> <h3>دبیرانی که تا کنون انتخاب نشده اند:</h3> <div className={styles.unselectedlist}> </div> </div> <div className={styles.footer}> <h3>دروسی که تاکنون انتخاب نشده اند:</h3> <div className={styles.unselectedlist}> </div> </div> </div> </>); }
    if (scheduleError) { const errorMessage = typeof scheduleError === 'object' && scheduleError.message ? scheduleError.message : scheduleError; return <div className={styles.container}><p>خطا در دریافت برنامه هفتگی: {String(errorMessage)}</p></div>; }
    if (!currentSchedule) { return <div className={styles.container}><p>کلاسی برای نمایش انتخاب نشده یا در حال ساخت جدول برنامه است...</p></div>; }

    // بخش ۶: رندر نهایی کامپوننت
    return (
        <>
            <div className={styles.container}>
                <div className={styles.editorWrapper}>
                    <h3>
                        ابتدا درس را انتخاب کرده بعد معلم مربوطه را انتخاب کنید و در نهایت روی زنگ مورد نظر کلیک کنید تا انتخاب شود (برای دروسی که تک زنگ هستند تیک تک زنگ را بزنید!)
                    </h3>

                    {error && (
                        <ErrorAccordion
                            title="خطا در ارسال اطلاعات"
                            generalMessage={error.generalMessage}
                            errors={error.details}
                        />
                    )}

                    <div className={styles.controlsContainer}>
                        <div className={styles.line}>
                            <Dropdown
                                options={classOptions}
                                onSelect={handleClassSelect}
                                initialValue={selectedClass ? selectedClass.name : 'پایه را انتخاب کنید'}
                            />
                            <Dropdown
                                options={lessonOptions}
                                onSelect={setSelectedLesson}
                                initialValue={selectedLesson || 'درس را انتخاب کنید'}
                                 clear={'درس را انتخاب کنید'}
                            />
                            <Dropdown
                                options={teacherOptions}
                                onSelect={setSelectedTeacher}
                                initialValue={selectedTeacher || 'معلم را انتخاب کنید'}
                                onScrollBottom={fetchTeachers}
                                clear={'معلم را انتخاب کنید'}
                            />
                            <Selector isActive={isHalfBellActive} onClick={toggleHalfBell} />
                            <button
                                className={styles.submitbut}
                                onClick={handleFinalSave}
                                disabled={isSaving}
                            >
                                {isSaving ? <LoadingSpinner/> : 'ثبت نهایی'}
                            </button>
                        </div>
                    </div>
                    <div className={styles.mainHeader}>برنامه هفتگی</div>
                    <div className={styles.weeklySchedule}>
                        <div className={`${styles.scheduleRow} ${styles.headerRow}`} style={scheduleRowStyle}>
                            <div className={styles.headerCell}>روز های هفته</div>
                            {classPeriods.map((period) => (
                                <div key={period.id} className={styles.headerCell}>{period.name}</div>
                            ))}
                        </div>
                        {currentSchedule.map((day, dayIndex) => (
                            <div className={styles.scheduleRow} style={scheduleRowStyle} key={dayIndex}>
                                <div className={styles.dayCell}>{day[0]}</div>
                                {day.slice(1).map((cellContent, timeIndex) => (
                                    <div
                                        key={timeIndex}
                                        className={`${styles.scheduleCell} ${cellContent ? styles.filledCell : ''} ${cellContent && Array.isArray(cellContent) ? styles.halfBell : ''}`}
                                        onClick={() => handleCellClick(dayIndex, timeIndex + 1)}
                                    >
                                        {/* ================= START OF MODIFICATION 2 ================= */}
                                        {cellContent && !Array.isArray(cellContent) && (
                                            <div className={styles.cellContentWrapper}>
                                                <span>
                                                    {cellContent.lesson}
                                                    {cellContent.teacher && ` (${cellContent.teacher})`}
                                                </span>
                                            </div>
                                        )}
                                        {cellContent && Array.isArray(cellContent) && (
                                            <>
                                                <div className={`${styles.halfBellPart} ${cellContent[0] ? styles.filledCell : ''}`} onClick={(e) => handleHalfBellClick(e, dayIndex, timeIndex + 1, 0)}>
                                                    {cellContent[0] && (
                                                        <div className={styles.cellContentWrapper}>
                                                            <span>
                                                                {cellContent[0].lesson}
                                                                {cellContent[0].teacher && ` (${cellContent[0].teacher})`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`${styles.halfBellPart} ${cellContent[1] ? styles.filledCell : ''}`} onClick={(e) => handleHalfBellClick(e, dayIndex, timeIndex + 1, 1)}>
                                                    {cellContent[1] && (
                                                        <div className={styles.cellContentWrapper}>
                                                            <span>
                                                                {cellContent[1].lesson}
                                                                {cellContent[1].teacher && ` (${cellContent[1].teacher})`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {/* ================= END OF MODIFICATION 2 ================= */}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.confooter}>
                <div className={styles.footer}>
                    <h3>دبیرانی که تا کنون انتخاب نشده اند:</h3>
                    <div className={styles.unselectedlist}>
                        {dynamicUnselectedData.teachers.map((teacher, index) => (<div key={index}><p>{teacher}</p></div>))}
                    </div>
                </div>
                <div className={styles.footer}>
                    <h3>دروسی که تاکنون انتخاب نشده اند:</h3>
                    <div className={styles.unselectedlist}>
                        {dynamicUnselectedData.courses.map((course, index) => (<div className={styles.flist} key={index}><p>{course}</p></div>))}
                    </div>
                </div>
            </div>
        </>
    );
}