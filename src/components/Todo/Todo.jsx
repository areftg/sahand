import React, { useState, useRef, useEffect } from 'react';
import style from "./Todo.module.css";
import remindlist from "../../assets/icons/remindlist.svg";
import clock from "../../assets/icons/clock.svg";
import trash from "../../assets/icons/Trash.svg";
import pen from "../../assets/icons/edit.svg";
import drop from "../../assets/icons/Drop.svg"
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// import های شما برای API
import api, { endpoints } from "../../config/api";

import moment from 'jalali-moment';

moment.locale('fa');

// [اصلاح] نام کامپوننت به LoadingIndicator تغییر یافت تا از قواعد نام‌گذاری React پیروی کند
const LoadingIndicator = () => {
    return (
        <div className={style.loadingContainer}>
            <div className={style.loadingContar}>
                <LoadingSpinner />
            </div>
            <h2>در حال بارگذاری...</h2>
        </div>
    );
}

const Dropdown = ({ title, options, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div className={style.dropdownContainer} ref={dropdownRef}>
            <button className={style.dropdownButton} onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled}>
                <span className={style.dropdowntext}>{title}</span>
                <img className={style.dropdownpic} src={drop} alt='' />
            </button>

            {isOpen && (
                <ul className={style.dropdownMenu}>
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className={style.dropdownItem}
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const MonthCalendar = ({ monthDate, onDayClick, selectedDate, validDates, holidays, reminders }) => {
    const startOfMonth = monthDate.clone().startOf('jMonth');
    const endOfMonth = monthDate.clone().endOf('jMonth');
    const today = moment();

    const days = [];
    let day = startOfMonth.clone().startOf('week');

    while (day.isBefore(endOfMonth.clone().endOf('week'))) {
        days.push(day.clone());
        day.add(1, 'day');
    }

    return (
        <div className={style.monthWrapper}>
            <div className={style.month}>
                <div className={style.monthheader}>
                    <p>{monthDate.format('jMMMM')}</p>
                    <p>{monthDate.format('jYYYY')}</p>
                </div>
                <div className={style.weeks}>
                    {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
                        <div className={style.week} key={weekIndex}>
                            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map(dayItem => {
                                const isCurrentMonth = dayItem.isSame(monthDate, 'jMonth');
                                const isToday = dayItem.isSame(today, 'day');
                                const isSelected = selectedDate && dayItem.isSame(selectedDate, 'day');
                                const formattedDate = dayItem.format('jYYYY/jMM/jDD');
                                const isValid = validDates.has(formattedDate);
                                const holidayName = holidays.get(formattedDate);
                                const remindersForThisDay = reminders.filter(
                                    reminder => reminder.reminder_date === formattedDate
                                );

                                let dayClasses = style.day;
                                if (!isCurrentMonth) dayClasses += ` ${style.otherMonth}`;
                                if (isToday) dayClasses += ` ${style.today}`;
                                if (dayItem.day() === 4 || dayItem.day() === 5) { // پنجشنبه و جمعه
                                    dayClasses += ` ${style.holyday}`;
                                }
                                if (holidayName) {
                                    dayClasses += ` ${style.officialHoliday}`;
                                }
                                if (isSelected) {
                                    dayClasses += ` ${style.selected}`;
                                }
                                if (!isValid) {
                                    dayClasses += ` ${style.disabled}`;
                                }

                                return (
                                    <div
                                        className={dayClasses}
                                        key={dayItem.format('YYYY-MM-DD')}
                                        onClick={() => !holidayName && isValid && onDayClick(dayItem)}
                                    >
                                        <div className={style.dayheader}>
                                            <p>{dayItem.format('dddd')}</p>
                                            <p>{dayItem.format('jD')}</p>
                                        </div>
                                        <div className={style.daycontent}>
                                            {holidayName && <span className={style.holidayName}>{holidayName}</span>}
                                            {remindersForThisDay.length > 0 && (
                                                <div className={style.remindersList}>
                                                    <div key={remindersForThisDay[0].id} className={style.reminderItem} title={remindersForThisDay[0].title}>
                                                        <h4 className={style.remindtitle}><div className={style.remindicon}><img src={clock} alt="table" />یادآوری</div></h4>
                                                        {remindersForThisDay[0].title}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Sidebaritem = ({ reminder, onEdit, onDelete }) => {
    return (
        <div className={style.sidebaritem}>
            <h4><div className={style.remindicon}><img src={clock} alt="table" />یادآوری</div></h4>
            <p className={style.sidebaritemtitle}>{reminder.title}</p>
            <p className={style.sidebaritemabout}>{`کلاس: ${reminder.class_info.class.name} - ${reminder.description || ''}`}</p>
            <div className={style.sidebaritemfooter}>
                <img src={trash} alt='حذف' onClick={() => onDelete(reminder.id)} />
                <img src={pen} alt='ویرایش' onClick={() => onEdit(reminder)} />
            </div>
        </div>
    );
};

const Tab1 = ({ remindersForDay, onEdit, onDelete, handleToggleAddMode }) => {
    return (
        <div className={style.list}>
            {remindersForDay.length > 0 ? (
                remindersForDay.map(reminder => (
                    <Sidebaritem
                        key={reminder.id}
                        reminder={reminder}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            ) : (
                <p className={style.noReminderText}>یادآوری برای این روز ثبت نشده است.</p>
            )}
            <div className={style.additem} onClick={handleToggleAddMode}>افزودن‌یادآوری</div>
        </div>
    );
};

const Tab2 = () => {
    return (
        <div>
            <p>محتوای تب مناسبت‌ها</p>
        </div>
    );
};

const AddReminderForm = ({
    isScheduleLoading, scheduleOptions, selectedSchedule, onScheduleSelect,
    reminderTitle, setReminderTitle, reminderDescription, setReminderDescription,
    isSubmitting, onSubmit, isEditing
}) => {
    return (
        <div className={style.addReminderForm}>
            <Dropdown
                title={
                    isScheduleLoading ? "در حال بارگذاری..."
                        : selectedSchedule ? selectedSchedule.label
                            : scheduleOptions.length > 0 ? "انتخاب برنامه کلاسی" : "برنامه‌ای یافت نشد"
                }
                options={scheduleOptions}
                onSelect={onScheduleSelect}
                disabled={isScheduleLoading || scheduleOptions.length === 0}
            />
            <input
                placeholder='عنوان یادآوری را وارد کنید'
                className={style.textinputt}
                type='text'
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                disabled={isSubmitting}
            />
            <textarea
                placeholder='توضیحات یادآوری را وارد کنید'
                className={style.textareaa}
                value={reminderDescription}
                onChange={(e) => setReminderDescription(e.target.value)}
                disabled={isSubmitting}
            />
            <button className={style.submitbutton} onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'در حال پردازش...' : (isEditing ? 'ویرایش' : 'ثبت')}
            </button>
        </div>
    );
};

export default function Todo() {
    const [activeTab, setActiveTab] = useState('reminders');
    const [isAddingReminder, setIsAddingReminder] = useState(false);
    const [visibleMonths, setVisibleMonths] = useState(4);
    const [selectedDate, setSelectedDate] = useState(moment());
    const calendarRef = useRef(null);
    const [validDates, setValidDates] = useState(new Set());
    const [holidays, setHolidays] = useState(new Map());
    const [reminders, setReminders] = useState([]);
    const [fetchedMonths, setFetchedMonths] = useState(new Set());
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [classScheduleOptions, setClassScheduleOptions] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isScheduleLoading, setIsScheduleLoading] = useState(false);
    const [reminderTitle, setReminderTitle] = useState('');
    const [reminderDescription, setReminderDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    // -----[جدید] State برای مدیریت بارگذاری اولیه صفحه-----
    const [isLoadingDates, setIsLoadingDates] = useState(true);
    const [isLoadingInitialReminders, setIsLoadingInitialReminders] = useState(true);
    // --------------------------------------------------------

    const handleScheduleSelect = (option) => {
        setSelectedSchedule(option);
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
    };

    const handleScroll = () => {
        const container = calendarRef.current;
        if (container) {
            if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
                setVisibleMonths(prevMonths => prevMonths + 4);
            }
        }
    };

    useEffect(() => {
        const container = calendarRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        const fetchValidReminderDates = async () => {
            try {
                const response = await api.get(`${endpoints.validreminder()}`);
                const data = response.data.data;
                const allDates = [];
                const holidayMap = new Map();
                Object.values(data).forEach(weekArray => {
                    weekArray.forEach(dayObject => {
                        allDates.push(dayObject.date);
                        if (dayObject.is_holiday) {
                            holidayMap.set(dayObject.date, dayObject.holiday_name);
                        }
                    });
                });
                setValidDates(new Set(allDates));
                setHolidays(holidayMap);
            } catch (error) {
                console.error("Error fetching valid reminder dates:", error);
            } finally {
                // [جدید] نشانگر پایان بارگذاری تاریخ‌ها
                setIsLoadingDates(false);
            }
        };
        fetchValidReminderDates();
    }, []);

    useEffect(() => {
        const fetchScheduleForDay = async () => {
            if (!selectedDate) return;
            const dayOfWeek = selectedDate.day();
            const dayId = dayOfWeek === 0 ? 7 : dayOfWeek;
            setIsScheduleLoading(true);
            setSelectedSchedule(null);
            setClassScheduleOptions([]);
            try {
                const response = await api.get(endpoints.teacherschdule(dayId));
                const scheduleObject = response.data.data;
                if (scheduleObject && typeof scheduleObject === 'object' && Object.keys(scheduleObject).length > 0) {
                    const scheduleList = Object.values(scheduleObject)[0] || [];
                    const formattedOptions = scheduleList.map((item) => ({
                        label: `${item.class_name} - ${item.course_name} (${item.start_time})`,
                        value: item.schedule_id
                    }));
                    setClassScheduleOptions(formattedOptions);
                } else {
                    setClassScheduleOptions([]);
                }
            } catch (error) {
                console.error("خطا در دریافت برنامه کلاسی:", error);
                setClassScheduleOptions([]);
            } finally {
                setIsScheduleLoading(false);
            }
        };
        fetchScheduleForDay();
    }, [selectedDate]);

    useEffect(() => {
        const fetchRemindersForVisibleMonths = async () => {
            if (isAddingReminder) return; // در حالت افزودن یادآوری، داده‌ها را دوباره دریافت نکن
    
            const promises = [];
            const newMonthsToMark = [];
            for (let i = 0; i < visibleMonths; i++) {
                const monthToShow = moment().add(i, 'jMonth');
                const year = monthToShow.jYear();
                const month = monthToShow.jMonth() + 1;
                const monthKey = `${year}/${month}`;
                if (!fetchedMonths.has(monthKey)) {
                    promises.push(api.get(endpoints.teacherreminder(month, year)));
                    newMonthsToMark.push(monthKey);
                }
            }
    
            if (promises.length === 0) {
                setIsLoadingInitialReminders(false); // اگر هیچ درخواستی وجود ندارد
                return;
            }
    
            try {
                const responses = await Promise.all(promises);
                const newReminders = responses.flatMap(response => response.data.data || []);
    
                // به‌روزرسانی reminders بدون پاک کردن داده‌های قبلی
                setReminders(prevReminders => {
                    const existingIds = new Set(prevReminders.map(r => r.id));
                    const uniqueNewReminders = newReminders.filter(r => !existingIds.has(r.id));
                    return [...prevReminders, ...uniqueNewReminders];
                });
    
                // به‌روزرسانی fetchedMonths
                setFetchedMonths(prevSet => new Set([...prevSet, ...newMonthsToMark]));
            } catch (error) {
                console.error("Error fetching reminders:", error);
            } finally {
                setIsLoadingInitialReminders(false);
            }
        };
    
        fetchRemindersForVisibleMonths();
    }, [visibleMonths, refetchTrigger]); // وابستگی فقط به visibleMonths و refetchTrigger

    
    const handleStartEdit = (reminderToEdit) => {
        setEditingReminder(reminderToEdit);
        setReminderTitle(reminderToEdit.title);
        setReminderDescription(reminderToEdit.description || '');
        
        const scheduleOption = {
            label: `${reminderToEdit.class_info.class.name} - ${reminderToEdit.class_info.course.name} (${reminderToEdit.class_info.start_time})`,
            value: reminderToEdit.class_info.schedule_id
        };
        setSelectedSchedule(scheduleOption);
        
        setIsAddingReminder(true);
    };

    const handleDeleteReminder = async (reminderId) => {
        if (window.confirm("آیا از حذف این یادآوری اطمینان دارید؟")) {
            try {
                await api.delete(endpoints.deletereminder(reminderId));
                setReminders(prevReminders => prevReminders.filter(r => r.id !== reminderId));
                alert("یادآوری با موفقیت حذف شد.");
            } catch (error) {
                console.error("خطا در حذف یادآوری:", error);
                alert("مشکلی در حذف یادآوری به وجود آمد.");
            }
        }
    };
    
    const handleReminderSubmit = async () => {
        if (!selectedSchedule || !selectedDate || !reminderTitle.trim()) {
            alert("لطفاً برنامه کلاسی و عنوان یادآوری را مشخص کنید.");
            return;
        }
    
        setIsSubmitting(true);
    
        const scheduleId = selectedSchedule.value;
        const reminderData = {
            reminder_date: selectedDate.format('jYYYY/jMM/jDD'),
            title: reminderTitle.trim(),
            description: reminderDescription.trim(),
        };
    
        try {
            if (editingReminder) {
                const response = await api.put(endpoints.updatereminder(editingReminder.id), reminderData);
                const updatedReminder = response.data.data; 
                setReminders(prev => prev.map(r => r.id === editingReminder.id ? updatedReminder : r));
                alert("یادآوری با موفقیت ویرایش شد.");
            } else {
                await api.post(endpoints.addreminder(scheduleId), reminderData);
                alert("یادآوری با موفقیت ثبت شد.");
            }
    
            setReminderTitle('');
            setReminderDescription('');
            setSelectedSchedule(null);
            setIsAddingReminder(false);
            setEditingReminder(null); 
    
            setReminders([]);
            setFetchedMonths(new Set());
            setRefetchTrigger(c => c + 1);
    
        } catch (error) {
            console.error("خطا در ثبت/ویرایش یادآوری:", error);
            alert("مشکلی در عملیات به وجود آمد. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleToggleAddMode = () => {
        setIsAddingReminder(prevState => !prevState);
        if (editingReminder) {
            setEditingReminder(null);
            setReminderTitle('');
            setReminderDescription('');
            setSelectedSchedule(null);
        }
    };

    const remindersForSelectedDate = reminders.filter(reminder => {
        if (!selectedDate) return false;
        const formattedSelectedDate = selectedDate.format('jYYYY/jMM/jDD');
        return reminder.reminder_date === formattedSelectedDate;
    });

    // [جدید] محاسبه وضعیت کلی بارگذاری صفحه
    const isPageLoading = isLoadingDates || isLoadingInitialReminders;

    return (
        <div className={style.constainer}>
            {/* [جدید] نمایش نشانگر بارگذاری تا زمانی که اطلاعات اولیه دریافت نشده‌اند */}
            {isPageLoading ? (
                <LoadingIndicator />
            ) : (
                <div className={style.main}>
                    <div className={style.sidebar}>
                        <div className={style.tabs}>
                            <p
                                className={activeTab === 'reminders' ? style.tabsactive : ''}
                                onClick={() => setActiveTab('reminders')}
                            >
                                یادآوری ها
                            </p>
                            <p
                                className={activeTab === 'events' ? style.tabsactive : ''}
                                onClick={() => setActiveTab('events')}
                            >
                                مناسبت ها
                            </p>
                        </div>

                        <button className={style.sidebaraddbutton} onClick={handleToggleAddMode}>
                            {isAddingReminder ? 'لغو' : <><p>+</p> افزودن یادآوری</>}
                        </button>

                        {isAddingReminder ? (
                            <AddReminderForm
                                isScheduleLoading={isScheduleLoading}
                                scheduleOptions={classScheduleOptions}
                                selectedSchedule={selectedSchedule}
                                onScheduleSelect={handleScheduleSelect}
                                reminderTitle={reminderTitle}
                                setReminderTitle={setReminderTitle}
                                reminderDescription={reminderDescription}
                                setReminderDescription={setReminderDescription}
                                isSubmitting={isSubmitting}
                                onSubmit={handleReminderSubmit}
                                isEditing={!!editingReminder}
                            />
                        ) : (
                            <>
                                <div className={style.sidebartitle}>
                                    <img src={remindlist} alt="table" />
                                    {selectedDate ? `یادآوری‌های ${selectedDate.format('dddd jD jMMMM')}` : 'روزی را انتخاب کنید'}
                                </div>
                                <div className={style.line} />
                                {activeTab === 'reminders' && <Tab1 
                                    remindersForDay={remindersForSelectedDate} 
                                    onEdit={handleStartEdit}
                                    onDelete={handleDeleteReminder}
                                    handleToggleAddMode={handleToggleAddMode}
                                />}
                                {activeTab === 'events' && <Tab2 />}
                            </> 
                        )}
                    </div>

                    <div className={style.calendar} ref={calendarRef}>
                        {Array.from({ length: visibleMonths }).map((_, index) => {
                            const monthToShow = moment().add(index, 'jMonth');
                            return (
                                <MonthCalendar
                                    key={index}
                                    monthDate={monthToShow}
                                    onDayClick={handleDayClick}
                                    selectedDate={selectedDate}
                                    validDates={validDates}
                                    holidays={holidays}
                                    reminders={reminders}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}