import React, { useState, useEffect } from 'react';
import styles from "./AlertPanel.module.css";
import { useAlerts } from '../../Context/AlertContext';
import api, { endpoints } from '../../config/api';

// وارد کردن کامپوننت‌ها و آیکون‌های مورد نیاز
import CloseIcon from '../../assets/icons/closee.svg';
import alertfill from '../../assets/icons/Alarm-set.svg';
import trash from "../../assets/icons/Trash.svg";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TimeInput from '../../utils/TimeInput';

// یک تابع کمکی برای ایجاد ID موقت در سمت کلاینت
const generateTempId = () => `new-${Date.now()}`;

const AlertPanel = ({ onClose }) => {
    // 1. دریافت داده‌ها و توابع از کانتکست سراسری
    const { timeSlots: initialAlerts, loading, error: contextError, refetch } = useAlerts();

    // 2. State های محلی برای مدیریت فرم
    const [alerts, setAlerts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState({ message: null, sourceId: null });
    const [isAutoAlertsOn, setIsAutoAlertsOn] = useState(false); // برای دکمه تاگل

    // 3. همگام‌سازی state محلی با داده‌های دریافتی از کانتکست
    useEffect(() => {
        // این لاگ به شما نشان می‌دهد که چه داده‌ای از کانتکست به این کامپوننت می‌رسد
        console.log("AlertPanel received from context:", { initialAlerts, loading, contextError });

        // فقط در صورتی که داده‌ها معتبر باشند، state محلی را آپدیت کن
        if (initialAlerts && Array.isArray(initialAlerts)) {
            // استفاده از کپی عمیق برای جلوگیری از تغییر ناخواسته state اصلی در کانتکست
            setAlerts(JSON.parse(JSON.stringify(initialAlerts)));
        }
    }, [initialAlerts, loading, contextError]); // وابستگی به هر سه برای اطمینان از همگام‌سازی

    // 4. توابع مدیریت رویدادها (Event Handlers)

    const handleTimeUpdate = (newTime, alertId, field) => {
        setAlerts(currentAlerts =>
            currentAlerts.map(alert =>
                alert.id === alertId ? { ...alert, [field]: newTime } : alert
            )
        );
        setSubmitError({ message: null, sourceId: null }); // پاک کردن خطا هنگام ویرایش
    };

    // تابع کمکی برای تبدیل اعداد به معادل فارسی
const toPersianNumeral = (number) => {
    const persianNumbers = {
        1: 'اول',
        2: 'دوم',
        3: 'سوم',
        4: 'چهارم',
        5: 'پنجم',
        6: 'ششم',
        7: 'هفتم',
        8: 'هشتم',
        9: 'نهم',
        10: 'دهم',
        // می‌توانید موارد بیشتری اضافه کنید
    };
    return persianNumbers[number] || number.toString(); // اگر عدد در لیست نبود، همان عدد را برگردان
};

    const handleAddAlert = () => {
        // محاسبه شماره زنگ جدید بر اساس تعداد زنگ‌های موجود
        const alertCount = alerts.length + 1;
        const newAlertName = `زنگ ${toPersianNumeral(alertCount)}`;
    
        const newAlert = {
            id: generateTempId(),
            name: newAlertName, // تنظیم نام به‌صورت "زنگ اول"، "زنگ دوم" و غیره
            start_time: '00:00',
            end_time: '00:00',
            type: "class_period",
            isActive: true,
            isNew: true,
        };
        setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    };

    const handleDeleteAlert = (alertIdToDelete) => {
        setAlerts(currentAlerts => {
            const updatedAlerts = currentAlerts
                .filter(alert => alert.id !== alertIdToDelete)
                .map((alert, index) => ({
                    ...alert,
                    name: `زنگ ${toPersianNumeral(index + 1)}`, // تنظیم مجدد نام‌ها
                }));
            return updatedAlerts;
        });
    };

    const handleToggleAutoAlerts = () => {
        setIsAutoAlertsOn(prevState => !prevState);
        // TODO: ارسال API برای ذخیره وضعیت کلی زنگ اتوماتیک
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError({ message: null, sourceId: null });

        const createPromises = [];
        const updatePromises = [];
        const deletePromises = [];

        const currentAlertIds = new Set(alerts.map(a => a.id));

        // شناسایی آیتم‌های حذف شده
        initialAlerts.forEach(initialAlert => {
            if (!currentAlertIds.has(initialAlert.id)) {
                deletePromises.push(api.delete(`${endpoints.adddtimeslot()}/${initialAlert.id}`));
            }
        });

        // شناسایی آیتم‌های جدید و ویرایش شده
        alerts.forEach(alert => {
            if (alert.isNew) {
                const { id, isNew, ...payload } = alert; // حذف پراپرتی‌های سمت کلاینت
                createPromises.push(api.post(endpoints.timeslot(), payload));
            } else {
                const originalAlert = initialAlerts.find(a => a.id === alert.id);
                if (originalAlert && (originalAlert.start_time !== alert.start_time || originalAlert.end_time !== alert.end_time)) {
                    const payload = {
                        name: alert.name,
                        start_time: alert.start_time,
                        end_time: alert.end_time,
                        type: alert.type,
                        isActive: alert.isActive,
                        academic_level_id: alert.academic_level?.id,
                    };
                    updatePromises.push(api.put(`${endpoints.adddtimeslot()}/${alert.id}`, payload));
                }
            }
        });

        try {
            await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);
            await refetch(); // فراخوانی مجدد داده‌های سراسری برای همگام‌سازی
      
        } catch (err) {
            const errorMessages = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : "خطا در ثبت تغییرات. لطفاً ورودی‌ها را بررسی کنید.";
            setSubmitError({ message: errorMessages, sourceId: null });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. منطق رندر کامپوننت

    // نمایش حالت لودینگ تا زمانی که داده‌ها از کانتکست دریافت شوند
    if (loading) {
        return (
            <div className={styles.settingsPanel}>
                <img className={styles.profilePanelIcon} src={CloseIcon} alt='بستن' onClick={onClose} />
                <img className={styles.toptitle} src={alertfill} alt='آیکون زنگ' />
                <h3>سیستم زنگ هوشمند</h3>
                <div className={`${styles.button} ${styles.green}`}>زنگ زدن به صورت دستی</div>
                <div className={`${styles.button}`}><Skeleton style={{ margin: "10px 10px", borderRadius: "25px" }} duration={2} height={34} width={80} /> زنگ اتوماتیک</div>
                <Skeleton duration={2} highlightColor="#69b0b2" count={5} style={{ margin: "10px 0" }} height={50} />
            </div>
        );
    }

    // محاسبه اینکه آیا تغییری برای ثبت وجود دارد یا نه
    const hasChanges = JSON.stringify(alerts) !== JSON.stringify(initialAlerts);

    return (
        <div className={styles.settingsPanel}>
            <img className={styles.profilePanelIcon} src={CloseIcon} alt='بستن' onClick={onClose} />
            <img className={styles.toptitle} src={alertfill} alt='آیکون زنگ' />
            <h3>سیستم زنگ هوشمند</h3>

            {submitError.message && <p className={styles.alerterror}>{submitError.message}</p>}
            {contextError.message && <p className={styles.alerterror}>{contextError.message}</p>}

            <div className={`${styles.button} ${styles.green} ${styles.first}`}>زنگ زدن به صورت دستی</div>
            <div className={`${styles.button}`} onClick={handleToggleAutoAlerts}>
                <div className={`${styles.togglebutton} ${isAutoAlertsOn ? styles.on : ''}`}>
                    <span className={styles.onText}>روشن</span>
                    <span className={styles.offText}>خاموش</span>
                    <div className={styles.circle}></div>
                </div> زنگ اتوماتیک
            </div>

            {/* رندر لیست زنگ‌ها */}
            {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                    <div
                        className={`${styles.alarms} ${!alert.isActive ? styles.alarmoff : ''} ${alert.isNew ? styles.newAlarm : ''}`}
                        key={alert.id}
                    >
                        <div className={styles.delete} onClick={() => handleDeleteAlert(alert.id)}>
                            <img src={trash} alt="حذف" />
                        </div>
                        <p className={styles.name}>{alert.name}</p>
                        <div className={styles.alarmcont}>
                            <p>از</p>
                            <TimeInput
                                defaultValue={alert.start_time}
                                onTimeChange={(newTime) => handleTimeUpdate(newTime, alert.id, 'start_time')}
                            />
                            <p>تا</p>
                            <TimeInput
                                defaultValue={alert.end_time}
                                onTimeChange={(newTime) => handleTimeUpdate(newTime, alert.id, 'end_time')}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p className={styles.noAlertsMessage}>در حال حاضر هیچ زنگی تعریف نشده است.</p>
            )}

            {/* دکمه‌های پایین پنل */}
            <div className={styles.butcont}>
                <div className={`${styles.button}  ${styles.green}`} onClick={handleAddAlert}>
                    <p>افزودن زنگ جدید</p>
                    <div><p>+</p></div>
                </div>
                <button
                    className={`${styles.button} ${styles.green}`}
                    onClick={handleSubmit}
                    disabled={!hasChanges || isSubmitting}
                >
                    {isSubmitting ? 'در حال ثبت...' : 'ثبت تغییرات'}
                </button>
            </div>
        </div>
    );
};

export default AlertPanel;