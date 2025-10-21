import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./SettingsPanel.module.css";
import CloseIcon from '../../assets/icons/closee.svg';
import bold from "../../assets/icons/Bold.svg"
import dark from "../../assets/icons/darmode.svg"
import info from "../../assets/icons/infoicon.svg"
import editweekday from "../../assets/icons/editweekday.svg"
import { useAuth } from "../../Context/AuthContext";
import setting from "../../assets/icons/setting.svg";


const SettingsPanel = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className={styles.settingsPanel}>
            <img className={styles.profilePanelIcon} src={CloseIcon} alt='' onClick={onClose} />
            <h3>تنظیمات</h3>
             <div className={styles.settingsPaneloption} onClick={() => navigate('/AddClass')} ><img alt='' src={setting} /><p>تنظیمات کلاس</p></div>
            {user?.role !== 'teacher' && (<div className={styles.settingsPaneloption} onClick={() => navigate('/WeekDayEdit')}><img alt='' src={editweekday} /><p>ویرایش برنامه ی هفتگی</p></div>)}
            <div className={styles.settingsPaneloption} style={{ opacity: 0.5, pointerEvents: "none" }} ><img alt='' src={bold} /><p>برجسته سازی متون</p></div>
            <div className={styles.settingsPaneloption} style={{ opacity: 0.5, pointerEvents: "none" }} ><img alt='' src={dark} /><p>فعالسازی حالت تاریک</p></div>
            <div className={styles.settingsPaneloption} onClick={() => navigate('/about')}><img alt='' src={info} /><p>درباره ی نرم افزار</p></div>
        </div>
    );
};

export default SettingsPanel;