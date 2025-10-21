import React, { useState, useEffect, useRef } from 'react';
import styles from '../components/Header/Header.module.css';
import alertIcon from '../assets/icons/Alarm.svg';
import clockIcon from '../assets/icons/clock.svg';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { showInfoNotification } from '../services/notificationService';
import { useAlerts } from '../Context/AlertContext';

export default function BellStatus({ role }) {
    const { timeSlots, loading, error } = useAlerts();
    const [currentBell, setCurrentBell] = useState(null);
    const [remainingTime, setRemainingTime] = useState('');
    const previousBellName = useRef(null);

    useEffect(() => {
        // اگر در حال بارگذاری یا خطا وجود دارد، یا timeSlots خالی است، از اجرای منطق جلوگیری کنید
        if (loading || error.message || timeSlots.length === 0) {
            if (!loading && !error.message && timeSlots.length === 0) {
                setCurrentBell({ name: "ساعت درسی تعریف نشده" });
                setRemainingTime('');
            }
            return;
        }

        // مرتب‌سازی timeSlots یک بار در ابتدای useEffect
        const sortedTimeSlots = [...timeSlots].sort((a, b) => a.start_time.localeCompare(b.start_time));

        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);

            const activeBell = sortedTimeSlots.find(bell => currentTime >= bell.start_time && currentTime < bell.end_time);
            let newBellName = null;

            if (activeBell) {
                newBellName = activeBell.name;
                setCurrentBell(activeBell);

                const currentIndex = sortedTimeSlots.findIndex(bell => bell.id === activeBell.id);
                const nextBell = sortedTimeSlots[currentIndex + 1];

                if (nextBell) {
                    const nextBellTime = new Date();
                    const [hours, minutes] = nextBell.start_time.split(':').map(Number);
                    nextBellTime.setHours(hours, minutes, 0, 0);

                    if (nextBellTime < now) {
                        nextBellTime.setDate(nextBellTime.getDate() + 1);
                    }

                    const diffInMinutes = Math.ceil((nextBellTime - now) / (1000 * 60));
                    setRemainingTime(` ${diffInMinutes}دقیقه تا زنگ بعد`);
                } else {
                    setRemainingTime('این زنگ، زنگ آخر است');
                }
            } else {
                const upcomingBell = sortedTimeSlots.find(bell => currentTime < bell.start_time);

                if (upcomingBell) {
                    newBellName = "زنگ تفریح";
                    setCurrentBell({ name: "زنگ تفریح" });
                    const nextBellTime = new Date();
                    const [hours, minutes] = upcomingBell.start_time.split(':').map(Number);
                    nextBellTime.setHours(hours, minutes, 0, 0);

                    if (nextBellTime < now) {
                        nextBellTime.setDate(nextBellTime.getDate() + 1);
                    }

                    const diffInMinutes = Math.ceil((nextBellTime - now) / (1000 * 60));
                    setRemainingTime(` ${diffInMinutes}دقیقه تا زنگ بعد`);
                } else {
                    newBellName = "پایان ساعت کاری";
                    setCurrentBell({ name: "پایان ساعت کاری" });
                    setRemainingTime('');
                }
            }

            // فقط در صورتی که نام زنگ تغییر کرده و مقدار معتبر است، نوتیفیکیشن نمایش دهید
            // if (previousBellName.current !== newBellName && newBellName) {
            //     showInfoNotification(`🔔 ${newBellName} شروع شد.`);

            // }
            previousBellName.current = newBellName;
        }, 1000);

        // تابع cleanup برای جلوگیری از ایجاد چندین interval
        return () => clearInterval(interval);
    }, [loading, error.message, timeSlots]); // وابستگی‌ها

    if (loading) {
        return (
            <>
                <Skeleton count={1} width={100} height={32} style={{ marginBottom: '4px', borderRadius: "9px" }} duration={2} highlightColor="#69b0b2" />
                <Skeleton count={1} width={140} height={32} style={{ marginBottom: '4px', marginLeft: "5px", borderRadius: "9px" }} duration={2} highlightColor="#69b0b2" />
            </>
        );
    }

    if (error.message) {
        return <div className={styles.leftbox} style={{ color: 'red' }}>{error.message}</div>;
    }

    return (
        <>
            {currentBell?.name && (
                <div className={styles.leftbox}>
                    <img src={alertIcon} alt='زنگ' />
                    {currentBell.name}
                </div>
            )}
            {remainingTime && remainingTime !== "a" && (
                <div className={styles.leftbox}>
                    <img src={clockIcon} alt='زمان باقیمانده' />
                    {remainingTime}
                </div>
            )}
        </>
    );
}