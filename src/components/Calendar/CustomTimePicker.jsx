import React, { useState, useEffect, useRef } from 'react';
import style from './CustomTimePicker.module.css';

export default function CustomTimePicker({ isOpen, onClose, onSelectTime, selectedTime }) {
    const [hour, setHour] = useState(selectedTime ? parseInt(selectedTime.split(':')[0]) : 0);
    const [minute, setMinute] = useState(selectedTime ? parseInt(selectedTime.split(':')[1]) : 0);
    const [isHourMode, setIsHourMode] = useState(true);
    const pickerRef = useRef(null);

    // Reset to hour mode when picker opens
    useEffect(() => {
        if (isOpen) {
            setIsHourMode(true);
        }
    }, [isOpen]);

    // Close picker on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

    const handleHourClick = (h) => {
        setHour(h);
        setIsHourMode(false); // Switch to minute mode
    };

    const handleMinuteClick = (m) => {
        setMinute(m); // Only update minute
    };

    const handleConfirm = () => {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        onSelectTime(time);
        onClose(); // Close on confirm
    };

    const handleBack = () => {
        setIsHourMode(true); // Go back to hour mode
    };

    if (!isOpen) return null;

    const renderClock = () => {
        const items = isHourMode ? hours : minutes;
        const radius = 80; // Radius of the clock
        const center = 100; // Center of the clock (200x200 SVG)

        return (
            <svg width="200" height="200" className={style.clock}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--outback)" strokeWidth="2" />
                {items.map((item, index) => {
                    const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2; // Start from top
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    const isSelected = isHourMode ? item === hour : item === minute;
                    return (
                        <g key={item} onClick={() => isHourMode ? handleHourClick(item) : handleMinuteClick(item)} className={style.clockItem}>
                            <circle
                                cx={x}
                                cy={y}
                                r={isSelected ? 8 : 6}
                                fill={isSelected ? 'var(--importantcolor)' : 'var(--backcolor)'}
                                stroke={isSelected ? 'var(--outbutton)' : 'none'}
                                strokeWidth="1"
                            />
                            <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fontSize="14"
                                fill={isSelected ? 'white' : 'var(--outbutton)'}
                            >
                                {item.toString().padStart(2, '0')}
                            </text>
                        </g>
                    );
                })}
                {/* Hand pointing to selected value */}
                {items.length > 0 && (
                    <line
                        x1={center}
                        y1={center}
                        x2={center + (radius - 10) * Math.cos(((isHourMode ? hour : minute / 5) / (isHourMode ? 24 : 12)) * 2 * Math.PI - Math.PI / 2)}
                        y2={center + (radius - 10) * Math.sin(((isHourMode ? hour : minute / 5) / (isHourMode ? 24 : 12)) * 2 * Math.PI - Math.PI / 2)}
                        stroke="var(--importantcolor)"
                        strokeWidth="2"
                    />
                )}
            </svg>
        );
    };

    return (
        <div className={style.picker} ref={pickerRef}>
            <div className={style.header}>
                {!isHourMode && (
                    <button className={style.backButton} onClick={handleBack}>برگشت</button>
                )}
                <div className={style.modeIndicator}>
                    {isHourMode ? 'انتخاب ساعت' : 'انتخاب دقیقه'}
                </div>
            </div>
            <div className={style.clockContainer}>
                {renderClock()}
            </div>
            <div className={style.buttons}>
                <button className={style.cancelButton} onClick={onClose}>لغو</button>
                {isHourMode && (
                    <button className={style.confirmButton} onClick={() => setIsHourMode(false)}>بعدی</button>
                )}
                {!isHourMode && (
                    <button className={style.confirmButton} onClick={handleConfirm}>تأیید</button>
                )}
            </div>
        </div>
    );
}