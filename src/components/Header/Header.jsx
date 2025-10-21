import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import calender from '../../assets/icons/Calender.svg';

import notif from "../../assets/icons/Notification.svg"
import profile from '../../assets/icons/Profile.svg';
import alertfill from '../../assets/icons/Alarm-set.svg';
import setting from '../../assets/icons/Settings.svg';
import parentlogout from '../../assets/icons/parentlogout.svg';

import icon from '../../assets/icons/sjm-logo-green.svg';
import styles from "./Header.module.css";
import BellStatus from '../../utils/BellStatus';
import CalendarHeader from '../Calendar/CalendarHeader';
import menu from "../../assets/icons/menu.svg";
import Headerdown from '../Headerdown/Headerdown';
import asmachat from "../../assets/icons/asmachat.svg";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../Context/AuthContext";

import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner"


 
const LazyProfilePanel = lazy(() => import('../ProfilePanel/ProfilePanel'));
const LazySettingsPanel = lazy(() => import('../SettingsPanel/SettingsPanel'));
const LazyAlertPanel = lazy(() => import('../AlertPanel/AlertPanel'));
const LazySubscribe = lazy(() => import('../Subscribe/Subscribe'));
const LazyNotif = lazy(() => import('../NotifPanel/NotifPanel'));

const DefaultPanelContent = ({ onClose, title, children }) => (
    <div className={styles.defaultPanel}>

        {children}

    </div>
);



export default function Header() {
   
    const dropdownRef = useRef(null);
    const [pos, setPos] = useState();
    const [text, setText] = useState("");
    const [hint, setHint] = useState("none");
    const navigate = useNavigate();
    const [activePanelContent, setActivePanelContent] = useState(null);
    const [cpos, setcPos] = useState();
    const [headerdown, setheaderdown] = useState(false);
    const { logout, user } = useAuth();
     
   

const handleIconClick = (panelType) => {
        if (activePanelContent === panelType) {
            setActivePanelContent(null);
        } else {
            setActivePanelContent(panelType);
        }
    };

    const handleClosePanel = () => {
        setActivePanelContent(null);
    };
    const handleheaderdown = () => {
        setheaderdown(!headerdown);
        
    };

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (activePanelContent && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                handleClosePanel();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activePanelContent]);


    const renderActivePanel = () => {
        switch (activePanelContent) {
            case 'profile':
                return (
                    <Suspense fallback={ <div className={styles.LoadingSpinner}><LoadingSpinner /></div>}>
                        <LazyProfilePanel onClose={handleClosePanel} />     
                    </Suspense>
                );
                 case 'notif':
                return (
                    <Suspense fallback={<div className={styles.LoadingSpinner}><LoadingSpinner /></div>}>
                    <LazyNotif onClose={handleClosePanel} />     
                    </Suspense>
                );
            case 'alert':
                return (
                    <Suspense fallback={ <div className={styles.LoadingSpinner}><LoadingSpinner /></div>}>
                        <DefaultPanelContent>
                            <LazyAlertPanel onClose={handleClosePanel} />
                        </DefaultPanelContent>
                    </Suspense>
                );
            case 'setting':
                return (
                    <Suspense fallback={<div className={styles.LoadingSpinner}><LoadingSpinner /></div>}>
                        <DefaultPanelContent>
                            <LazySettingsPanel onClose={handleClosePanel} />
                        </DefaultPanelContent>
                    </Suspense>
                );
                 case 'Subscribe':
                return (
                    <Suspense fallback={<div className={styles.LoadingSpinner}><LoadingSpinner /></div>}>
                        <DefaultPanelContent>
                            <LazySubscribe onClose={handleClosePanel} />
                        </DefaultPanelContent>
                    </Suspense>
                );
            default:
                return null;
        }
    };

    const [isMobile, setIsMobile] = useState();
    
  useEffect(() => {
    // تابعی برای چک کردن سایز صفحه
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 500);
    };

    checkMobile(); // موقع لود اول صفحه اجرا میشه

    window.addEventListener('resize', checkMobile); // هر بار سایز صفحه تغییر کرد اجرا میشه

    // تمیزکاری (وقتی کامپوننت از بین رفت این رو حذف میکنه)
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

    useEffect(() => {
        if (!user) {
           navigate("/Login")
        }
    }, [user, navigate]);
     const schoolId = user?.school_id;
       const handleLogout = (e) => {
        e.stopPropagation();
        e.preventDefault();
        logout();
    };

    return (
        <>
            <div onClick={handleheaderdown} className={`${styles.Header} ignore-close`} ref={dropdownRef}>
                <div className={styles.left}>
                    {schoolId && user?.roles[0] !== 'parent' &&
                    <>
                     <img className={styles.menuicon} src={menu} alt=''></img>
                    </>}
                   
               
                    {schoolId && user?.roles[0] === 'parent' && <>
                    <div  className={styles.logoutparent}>
                          <img src={parentlogout} alt='خروج' onClick={handleLogout} />
                        <p onClick={handleLogout}>خروج از حساب کاربری</p>
                      
                    </div>
                    </>}
                    {schoolId && user?.roles[0] !== 'parent' && (
                    <>
                    <div className={`${styles.leftbox} ${styles.leftrespons}`}><img src={calender} alt='تقویم' />  <CalendarHeader /></div>
                       {schoolId && user?.roles[0] !== 'parent' && ( <BellStatus role={user?.roles[0]} />)}
                       
                    </>
                    )}
                </div>
                <div className={styles.right}>
                    <div className={styles.hover}>
                        <div className={styles.hoverl} style={{ right: pos, display: hint }}>{text}</div>
                    </div>

                    <img src={icon} className={styles.sjmlogo} alt='sjm'></img>
                   
                    {schoolId && user?.roles[0] === 'parent' &&
                  
                    <div className={styles.parentleftbox}>
                      <p>ویژه‌‌اولیا</p>
                    </div>
                   
                    }
                     <div className={styles.Line} />
                    
                   {user?.roles[0] !== 'parent' && (
                    <>
                     
                    <div className={styles.rightbox} onMouseLeave={() => { setHint("none") }}>

                        <div className={styles.iconContainer}>
                            <img
                                src={profile}
                                onMouseEnter={() => { setText("پروفایل"); setPos("40px"); setHint("block") }}
                                onClick={() => { handleIconClick('profile'); setcPos("70px") }}
                                alt='پروفایل'
                                className={activePanelContent === 'profile' ? styles.activeIcon : ''}
                            />
                        </div>
                        <div className={styles.iconContainer}>
                            <img
                                src={setting}
                                onMouseEnter={() => { setText("تنظیمات"); setPos("85px"); setHint("block") }}
                                onClick={() => { handleIconClick('setting'); setcPos("130px") }}
                                alt='تنظیمات'
                                className={activePanelContent === 'setting' ? styles.activeIcon : ''}
                            />
                        </div>
                     

                        {/* <div className={`${styles.noDrop} ${styles.iconContainer}`}>
                            <img
                                src={asmachat}
                                onMouseEnter={() => { setText("پیامرسان"); setPos("157px"); setHint("block") }}
                                onClick={() => { navigate("/chat") }}
                                alt='پیام رسان'
                                className={`${styles.noDrop} activePanelContent === 'notification' ? styles.activeIcon : ''`}
                            />
                        </div> */}
                           {/* <div className={styles.iconContainer}>
                            <img
                                src={notif}
                                onMouseEnter={() => { setText("اعلان‌ها"); setPos("135px"); setHint("block") }}
                                onClick={() => { handleIconClick('notif'); setcPos("150px") }}
                                alt='اعلان‌ها'
                                className={activePanelContent === 'notif' ? styles.activeIcon : ''}
                            />
                        </div> */}
                          {user?.roles[0] !== 'teacher' && (<div className={styles.iconContainer}>
                            <img
                                src={alertfill}
                                onMouseEnter={() => { setText("زنگ"); setPos("140px"); setHint("block") }}
                                onClick={() => { handleIconClick('alert'); setcPos("150px") }}
                                alt='زنگ'
                                className={activePanelContent === 'alert' ? styles.activeIcon : ''}
                            />
                        </div>)}
                          {/* {user?.roles[0] === 'principal' && (<div className={styles.iconContainer}>
                            <div
                                
                                onMouseEnter={() => { setText("اشتراک"); setPos("330px"); setHint("block") }}
                                onClick={() => { handleIconClick('Subscribe'); setcPos("200px") }}
                                alt='subscription'
                                className={styles.sub}
                            >
                                <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M35.704 29.6333C36.5632 29.6181 37.3685 29.3808 38.0896 28.9916L44.5391 35.4411H36.1153V43.8649L26.9972 34.7468C27.0147 34.7198 27.0356 34.6955 27.0566 34.6712C27.08 34.644 27.1035 34.6167 27.1222 34.5855L27.2966 34.296L27.5895 34.4605C28.3678 34.8935 29.2454 35.1186 30.1265 35.1186C32.9636 35.1186 35.3146 32.8126 35.3617 29.9755L35.365 29.6366L35.704 29.6333ZM0.735352 35.4411L7.18153 28.9949C7.9026 29.3841 8.71292 29.6181 9.57046 29.6333L9.9061 29.6399L9.91268 29.9755C9.95985 32.8126 12.3075 35.1219 15.1446 35.1219C16.0275 35.1219 16.9033 34.8918 17.6816 34.4605L17.9778 34.296L18.1522 34.5855C18.1709 34.6167 18.1944 34.644 18.2179 34.6712C18.2388 34.6955 18.2598 34.7198 18.2772 34.7468L9.15914 43.8649V35.4411H0.735352Z" fill="#69B0B2"/>
                                    <path d="M22.6405 0.0644531C22.023 0.0644531 21.406 0.363761 21.0446 0.966062L20.3404 2.14079C20.0371 2.64621 19.536 2.98611 18.9683 3.14111C18.9615 3.1428 18.9585 3.14601 18.9518 3.14769C18.3773 3.30606 17.7679 3.25978 17.2473 2.97L16.0495 2.30531C14.8214 1.62299 13.3091 2.49614 13.2855 3.90123L13.2592 5.28655C13.249 5.87284 12.9892 6.41865 12.5747 6.8331C12.5697 6.83647 12.5649 6.84121 12.5616 6.84626C12.1471 7.2624 11.6013 7.52059 11.015 7.5307L9.6264 7.55373C8.22131 7.57732 7.34816 9.0912 8.03049 10.3211L8.69847 11.5221C8.98487 12.0393 9.03284 12.644 8.87615 13.2135C8.8711 13.2236 8.86965 13.233 8.86628 13.2431C8.71297 13.8075 8.37291 14.3038 7.87254 14.6054L6.69453 15.3128C5.48992 16.0356 5.48992 17.7819 6.69453 18.5047L7.87254 19.2121C8.3746 19.5137 8.71297 20.01 8.86628 20.5744C8.86965 20.5845 8.8695 20.5955 8.87286 20.6073C9.02955 21.1768 8.98487 21.7831 8.69847 22.2987L8.03049 23.4997C7.34816 24.7279 8.22131 26.2402 9.6264 26.2638L11.0117 26.2868C11.5997 26.2969 12.1438 26.5601 12.5583 26.9745L12.5714 26.9877C12.9876 27.4021 13.249 27.9479 13.2592 28.5342L13.2822 29.9196C13.3058 31.3246 14.8181 32.1978 16.0462 31.5155L17.2473 30.8475C17.7645 30.5611 18.3692 30.5164 18.9386 30.6731C18.9487 30.6765 18.9614 30.6763 18.9715 30.6797C19.5359 30.833 20.0323 31.1714 20.3338 31.6734L21.0413 32.8514C21.7641 34.056 23.5104 34.056 24.2331 32.8514L24.9406 31.6734C25.2422 31.1714 25.7385 30.833 26.3029 30.6797C26.313 30.6763 26.3224 30.6765 26.3325 30.6731C26.9019 30.5164 27.5083 30.5611 28.0238 30.8475L29.2249 31.5155C30.4531 32.1978 31.9686 31.3246 31.9922 29.9196L32.0153 28.5342C32.0254 27.9463 32.2852 27.4021 32.6997 26.9877L32.7128 26.9745C33.1273 26.5584 33.6731 26.2969 34.2594 26.2868L35.648 26.2638C37.0531 26.2402 37.9263 24.7279 37.2439 23.4997L36.5759 22.2987C36.2895 21.7814 36.2416 21.1768 36.3983 20.6073C36.4016 20.5972 36.4048 20.5862 36.4081 20.5744C36.5614 20.01 36.8998 19.5137 37.4019 19.2121L38.5799 18.5047C39.7879 17.7802 39.7878 16.0356 38.5832 15.3128L37.4052 14.6054C36.9031 14.3038 36.5647 13.8075 36.4114 13.2431C36.4081 13.233 36.4049 13.2253 36.4015 13.2135C36.2449 12.644 36.2928 12.0377 36.5792 11.5221L37.2472 10.3211C37.9295 9.09289 37.0564 7.57732 35.6513 7.55373L34.2627 7.5307C33.6747 7.52059 33.1306 7.26071 32.7161 6.84626L32.703 6.8331C32.2868 6.41865 32.0287 5.87284 32.0185 5.28655L31.9955 3.89794C31.9719 2.49285 30.4564 1.6197 29.2282 2.30202L28.0271 2.97C27.5099 3.25641 26.9052 3.30437 26.3358 3.14769C26.3257 3.14432 26.318 3.14119 26.3062 3.13782C25.7418 2.98451 25.2454 2.64613 24.9439 2.14408L24.2364 0.966062C23.875 0.363761 23.258 0.0644531 22.6405 0.0644531Z" fill="#2B2D5A"/>
                                </svg>
                            </div>
                        </div>)} */}
                       
                        
                    </div>
                    </>
                   )}
                </div>


                {activePanelContent && (
                    <div className={styles.rightSidePanelContainer} style={{ right: cpos }}>
                        {renderActivePanel()}
                    </div>
                )}
            </div>
            {user?.roles[0] !== 'parent' && isMobile && headerdown && <Headerdown headerdown={handleheaderdown} />}
        </>
    );
}