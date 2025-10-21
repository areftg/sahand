import React, { useState, useEffect, useCallback } from 'react';
import styles from './Week.module.css';
import Dropdown from "../DropDown/DropDown";
import api, { endpoints } from "../../config/api";
import { useParams } from 'react-router-dom';
import { useAlerts } from '../../Context/AlertContext';
import weekdaywhite from "../../assets/icons/weekdaywhite.svg";

export default function Week() {
    const { gradeIdFromUrl } = useParams();
    const { timeSlots } = useAlerts();

    const [apiGrades, setApiGrades] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [timeSlotIdsInSchedule, setTimeSlotIdsInSchedule] = useState([]);
    
    const [activeTimeSlotId, setActiveTimeSlotId] = useState(null);
    const [currentDayIndex, setCurrentDayIndex] = useState(null);

    const [gradesLoading, setGradesLoading] = useState(false);
    const [gradesError, setGradesError] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);

    // مرحله ۱: State برای مدیریت دراپ‌دان فعال
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const fetchGrades = async () => {
            setGradesLoading(true);
            setGradesError(null);
            try {
                const response = await api.get(endpoints.classes());
                const gradeData = Array.isArray(response.data.data) ? response.data.data : [];
                setApiGrades(gradeData);
                if (gradeData.length > 0) {
                    let classToSelect = gradeData.find(g => g.id === parseInt(gradeIdFromUrl, 10)) || gradeData[0];
                    setSelectedClass(classToSelect);
                }
            } catch (err) {
                setGradesError("خطا در دریافت لیست کلاس‌ها.");
                console.error(err);
            } finally {
                setGradesLoading(false);
            }
        };
        fetchGrades();
    }, [gradeIdFromUrl]);

    useEffect(() => {
        if (timeSlots) {
            const sortedPeriods = timeSlots
                .filter(slot => slot.type === 'class_period')
                .sort((a, b) => a.start_time.localeCompare(b.start_time));
            
            setTimeSlotIdsInSchedule(sortedPeriods.map(p => p.id));
        }
    }, [timeSlots]);
      
    useEffect(() => {
        const updateCurrentStatus = () => {
            if (timeSlots && timeSlots.length > 0) {
                const now = new Date();
                let activeId = null;
                for (const slot of timeSlots) {
                    const startTime = new Date();
                    const [startH, startM] = slot.start_time.split(':').map(Number);
                    startTime.setHours(startH, startM, 0, 0);

                    const endTime = new Date();
                    const [endH, endM] = slot.end_time.split(':').map(Number);
                    endTime.setHours(endH, endM, 0, 0);

                    if (now >= startTime && now <= endTime) {
                        activeId = slot.id;
                        break;
                    }
                }
                setActiveTimeSlotId(activeId);
            }

            const jsDayToScheduleIndex = {
                6: 0, // Saturday (شنبه)
                0: 1, // Sunday (یکشنبه)
                1: 2, // Monday (دوشنبه)
                2: 3, // Tuesday (سه‌شنبه)
                3: 4, // Wednesday (چهارشنبه)
            };
            const todayJs = new Date().getDay();
            setCurrentDayIndex(jsDayToScheduleIndex[todayJs]);
        };
        
        updateCurrentStatus();
        const interval = setInterval(updateCurrentStatus, 60000);
        return () => clearInterval(interval);
    }, [timeSlots]);

    const fetchScheduleForClass = useCallback(async () => {
        if (!selectedClass || timeSlotIdsInSchedule.length === 0) return;

        setScheduleLoading(true);
        setScheduleError(null);
        setWeeklySchedule([]);

        const apiDayToFrontendIndex = { 6: 0, 7: 1, 1: 2, 2: 3, 3: 4 };

        try {
            const response = await api.get(endpoints.weekday(selectedClass.id));
            const scheduleByDay = response.data.data?.schedule_by_day || [];
            const holidaysFromServer = response.data.data?.weekly_holidays || [];
            
            const timeSlotIdToIndexMap = timeSlotIdsInSchedule.reduce((acc, id, index) => {
                acc[id] = index; return acc;
            }, {});

            const numPeriods = timeSlotIdsInSchedule.length;
            const initialDayTemplate = () => Array(numPeriods).fill(null);
            
            const initialSchedule = [
                { day: "شنبه", is_holiday: holidaysFromServer[0]?.is_holiday || false, details: holidaysFromServer[0]?.details, classes: initialDayTemplate() },
                { day: "یکشنبه", is_holiday: holidaysFromServer[1]?.is_holiday || false, details: holidaysFromServer[1]?.details, classes: initialDayTemplate() },
                { day: "دوشنبه", is_holiday: holidaysFromServer[2]?.is_holiday || false, details: holidaysFromServer[2]?.details, classes: initialDayTemplate() },
                { day: "سه‌شنبه", is_holiday: holidaysFromServer[3]?.is_holiday || false, details: holidaysFromServer[3]?.details, classes: initialDayTemplate() },
                { day: "چهارشنبه", is_holiday: holidaysFromServer[4]?.is_holiday || false, details: holidaysFromServer[4]?.details, classes: initialDayTemplate() },
            ];

            scheduleByDay.forEach(dayData => {
                const dayIndex = apiDayToFrontendIndex[dayData.day_of_week_id];
                
                if (dayIndex === undefined || dayIndex >= initialSchedule.length) return;

                dayData.entries.forEach(entry => {
                    const timeIndex = timeSlotIdToIndexMap[entry.time_slot_id];
                    if (timeIndex === undefined) return;

                    const cellContent = { 
                        lesson: entry.course?.name, 
                        teacher: entry.teacher?.full_name, 
                        id: entry.id 
                    };

                    if (entry.division_type === 'full' || !entry.division_type) {
                        initialSchedule[dayIndex].classes[timeIndex] = cellContent;
                    } else {
                        if (!Array.isArray(initialSchedule[dayIndex].classes[timeIndex])) {
                            initialSchedule[dayIndex].classes[timeIndex] = [null, null];
                        }
                        if (entry.division_type === 'first_half') {
                            initialSchedule[dayIndex].classes[timeIndex][0] = cellContent;
                        } else if (entry.division_type === 'second_half') {
                            initialSchedule[dayIndex].classes[timeIndex][1] = cellContent;
                        }
                    }
                });
            });

            setWeeklySchedule(initialSchedule);
        } catch (err) {
            setScheduleError("خطا در دریافت برنامه هفتگی.");
            console.error(err);
        } finally {
            setScheduleLoading(false);
        }
    }, [selectedClass, timeSlotIdsInSchedule]);

    useEffect(() => {
        fetchScheduleForClass();
    }, [fetchScheduleForClass]);

    // مرحله ۲: تابع کنترل‌کننده برای باز و بسته کردن دراپ‌دان
    const handleDropdownToggle = (dropdownId) => {
        setActiveDropdown(prev => (prev === dropdownId ? null : dropdownId));
    };

    const handleSelect = (option) => {
        setSelectedClass(apiGrades.find(g => g.id === option.value));
    };
    
    const dropdownOptions = apiGrades.map(grade => ({ value: grade.id, label: grade.name }));
    
    const scheduleColumnCount = timeSlotIdsInSchedule.length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.right}>
                    <img src={weekdaywhite} alt='' />
                   <h1>برنامه ی هفتگی</h1>
                </div>
                <div className={styles.filter}>
                    {gradesLoading ? <p>...</p> :
                        // مرحله ۳: پاس دادن props به Dropdown
                        <Dropdown 
                            options={dropdownOptions}
                            defualt={selectedClass ? selectedClass.name : "کلاسی را انتخاب کنید"}
                            onSelect={handleSelect} 
                            mobileBehavior="dropdown"
                            isOpen={activeDropdown === 'class-selector'}
                            onToggle={() => handleDropdownToggle('class-selector')}
                        />
                    }
                    </div>
            </div>
            
            <div className={styles.days}>
                {scheduleLoading && <p>در حال بارگذاری...</p>}
                {scheduleError && <p style={{color: 'red'}}>{scheduleError}</p>}
                
                {!scheduleLoading && !scheduleError && (
                    <>
                        {weeklySchedule.map((day, dayIndex) => {
                            return (
                                <div className={`${styles.day} ${day.is_holiday ? styles.holiday : ''}`} key={dayIndex}>
                                    <p>{day.day}{day.is_holiday && <span className={styles.holidayLabel}>تعطیل</span>}</p>

                                    {Array.from({ length: scheduleColumnCount }).map((_, timeIndex) => {
                                        const session = day.classes[timeIndex];
                                        const timeSlotId = timeSlotIdsInSchedule[timeIndex];
                                        const isTheCurrentClass = (dayIndex === currentDayIndex) && (timeSlotId === activeTimeSlotId);
                                        
                                        return (
                                            <div key={timeIndex} className={`${styles.class} ${isTheCurrentClass ? styles.activeClassNow : ''} ${Array.isArray(session) ? styles.double : ''}`}>
                                                <div className={styles.now}>
                                                    <div className={styles.nowloader}>
                                                        <div/>
                                                        <div/>
                                                    </div>
                                                </div>
                                                {Array.isArray(session) ? (
                                                    session.map((cls, innerIdx) => (
                                                        <div key={innerIdx} className={styles.half}>
                                                            {cls?.lesson ? <p>{cls.lesson}</p> : <p></p>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    session?.lesson ? <p>{session.lesson}</p> : <p>------</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}