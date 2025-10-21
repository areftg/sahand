import style from "./Student.module.css";
import React, { useState, useEffect, useMemo } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import StudentRow from "../../components/StudentRow/StudentRow";
import Dropdown from "../DropDown/DropDown";
import { useAbsence } from '../../Context/AbsenceContext';
import api, { endpoints } from "../../config/api";
import { showErrorNotification } from "../../services/notificationService";


export default function Student() {
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState("");
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [dropdownLabel, setDropdownLabel] = useState("در حال بارگذاری کلاس‌ها...");
    const { studentStatuses, setStatus, setInitialStatuses, setSs, students, setStudents, searchQuery, sdate, setSdate } = useAbsence();

    const [schedules, setSchedules] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleDropdownLabel, setScheduleDropdownLabel] = useState("ابتدا کلاس را انتخاب کنید");
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const userString = localStorage.getItem('user');
                if (!userString) throw new Error("کاربر شناسایی نشد.");

                const parsedUser = JSON.parse(userString);
                setUser(parsedUser);

                if (parsedUser.role.name === 'teacher') {
                    setDropdownLabel("");
                    const res = await api.get(endpoints.Thozor());
                    const data = res.data.data;

                    if (!data || !data.students || data.students.length === 0) {
                        showErrorNotification(res.data.message);
                        setStudents([]);
                        setError(res.data.message);
                        setClassName("کلاسی یافت نشد");
                        setLoading(false);
                        return;
                    }

                    setStudents(data.students);
                    setClassName(data.class_name || "کلاس شما");
                    setSs(data.class_schedule_id);

                    const initialStatuses = {};
                    (data.students || []).forEach(student => {
                        initialStatuses[student.enrollment_id] = student.daily_statuses?.[0]?.status || "present";
                    });
                    setInitialStatuses(initialStatuses);

                    setLoading(false);
                } else {
                    const res = await api.get(endpoints.classes());
                    const fetchedClasses = res.data.data || [];
                    if (fetchedClasses.length === 0) {
                        showErrorNotification("شما کلاسی ندارید.");
                        setDropdownLabel("کلاسی برای شما وجود ندارد");
                        setLoading(false);
                        return;
                    }
                    setClasses(fetchedClasses);

                    const defaultClass = fetchedClasses[0];

                    setSelectedClassId(defaultClass.id);
                    setDropdownLabel(defaultClass.name);
                    setSs(defaultClass.id);
                }
            } catch (err) {
                setError(err.message);
                
                showErrorNotification(err.message || "خطا در بارگذاری اولیه.");
                setDropdownLabel("خطا در بارگذاری");
                setLoading(false);
            }
        };
        initialize();
    }, []);

    useEffect(() => {
        if (!selectedClassId || (user && user.role.name === 'teacher')) {
            setSchedules([]);
            setSelectedScheduleId(null);
            setScheduleDropdownLabel("ابتدا کلاس را انتخاب کنید");
            return;
        }

        const fetchSchedules = async () => {
            setScheduleLoading(true);
            setStudents([]);
            setScheduleDropdownLabel("در حال بارگذاری زنگ‌ها...");
            try {
                const res = await api.get(endpoints.getclassschdule(selectedClassId));
                const schedulesByDay = res.data.data || {};

                // Flatten the schedules object into a single array
                const allSchedules = Object.values(schedulesByDay).flatMap(day =>
                    day.schedules.map(sch => ({
                        ...sch,
                        date: day.date  // اینجا تاریخ روزش رو تزریق می‌کنیم
                    }))
                );


                if (allSchedules.length > 0) {
                    setSchedules(allSchedules);
                    const firstSchedule = allSchedules[0];
                    setSdate(schedulesByDay[firstSchedule.day_of_week.name].date); // Set the date

                    setSelectedScheduleId(firstSchedule.id);
                    const firstScheduleLabel = `${firstSchedule?.day_of_week.name} - ${firstSchedule.course.name} (${firstSchedule.time_slot.start_time} - ${firstSchedule.time_slot.end_time})`;
                    setScheduleDropdownLabel(firstScheduleLabel);
                } else {
                    showErrorNotification("برای این کلاس زنگی تعریف نشده است.");
                    setScheduleDropdownLabel("زنگی یافت نشد");
                    setSchedules([]);
                    setSelectedScheduleId(null);
                    setSdate(null);
                }
            } catch (err) {
              
                setScheduleDropdownLabel("خطا");
            } finally {
                setScheduleLoading(false);
            }
        };
        fetchSchedules();
    }, [selectedClassId, user, setSdate]);

    useEffect(() => {
        if (!selectedScheduleId || (user && user.role?.name === 'teacher')) {
            return;
        }

        const fetchStudents = async () => {
            setLoading(true);
            setStudents([]);
            try {
                const res = await api.get(endpoints.hozor(selectedClassId));
                const data = res.data.data;

                if (!data || !data.students || data.students.length === 0) {
                    showErrorNotification("برای این زنگ، دانش‌آموزی یافت نشد.");
                    setStudents([]);
                } else {
                    setStudents(data.students);
                }

                setClassName(data.class_name || dropdownLabel);

                const initialStatuses = {};
                (data.students || []).forEach(student => {
                    initialStatuses[student.enrollment_id] = student.daily_statuses?.[0]?.status || "present";
                });
                setInitialStatuses(initialStatuses);
            } catch (err) {
                showErrorNotification("خطا در دریافت اطلاعات دانش‌آموزان.");
                setError("خطا در دریافت اطلاعات دانش‌آموزان.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedScheduleId, user]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery) {
            return students;
        }
        return students.filter(student =>
            student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };

    const classOptions = useMemo(() => classes.map(cls => ({
        value: cls.id,
        label: cls.name
    })), [classes]);

    const scheduleOptions = useMemo(() => schedules.map(sch => {
        // ایمن‌سازی برای جلوگیری از خطا
        const dayName = sch?.day_of_week?.name || "نامعلوم";
        const courseName = sch?.course?.name || "نامعلوم";
        const startTime = sch?.time_slot?.start_time || "?";
        const endTime = sch?.time_slot?.end_time || "?";
        const fullDate = sch?.date || '';
       

        return {
            value: sch.id,
            label: `${fullDate} - ${courseName} `,
            date: fullDate,
        };
    }), [schedules]);


    const handleSelectClass = (option) => {
        setSelectedClassId(option.value);
        setDropdownLabel(option.label);
        setSelectedScheduleId(null);
    };

    const handleSelectSchedule = (option) => {
        setSelectedScheduleId(option.value);
        setScheduleDropdownLabel(option.label);
        setSs(option.value);
        setSdate(option.date); // Set the date for the selected schedule
    };

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div className={style.right}>
                    <h1>لیست دانش آموزان <span className={style.displayon}>{className}</span></h1>
                    <p>{Object.values(studentStatuses).filter(s => s === "absent").length} نفر غایب هستند.</p>
                </div>
                <div className={style.left}>
                    {user && user.role.name !== 'teacher' && (
                        <>
                        <Dropdown
                                options={classOptions}
                                defualt={dropdownLabel}
                                onSelect={handleSelectClass}
                                isOpen={activeDropdown === 'class-select'}
                                onToggle={() => handleDropdownToggle('class-select')}
                                mobileBehavior="arrow"
                            />
                            <Dropdown
                                options={scheduleOptions}
                                defualt={scheduleDropdownLabel}
                                onSelect={handleSelectSchedule}
                                disabled={scheduleLoading || schedules.length === 0}
                                isOpen={activeDropdown === 'schedule-select'}
                                onToggle={() => handleDropdownToggle('schedule-select')}
                                mobileBehavior="arrow"
                            />
                            
                        </>
                    )}
                </div>
            </div>
            <div className={style.table}>
                {loading ? <Skeleton height={60} count={5} /> :
                    filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                        <StudentRow
                            key={student.enrollment_id}
                            student={student}
                            index={index}
                            status={studentStatuses[student.enrollment_id] || "present"}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            setStatus={setStatus}
                        />
                    )) : (
                        <div>{searchQuery ? "دانش‌آموزی با این نام یافت نشد." : (error || "دانش‌آموزی برای نمایش وجود ندارد.")}</div>
                    )
                }
            </div>
        </div>
    );
}