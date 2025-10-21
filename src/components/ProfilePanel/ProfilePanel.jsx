import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import styles from "../ProfilePanel/ProfilePanel.module.css";
import api, { endpoints } from "../../config/api";
import profile from "../../assets/icons/defaultprofile.svg"

// Import your icons and images
import CloseIcon from '../../assets/icons/closee.svg';
import ChangeSchoolIcon from '../../assets/icons/change_school_icon.svg';
import DropdownArrowUpIcon from '../../assets/icons/Drop.svg';
import AboutSchool from '../../assets/icons/aboutschool.svg';
import Folder from "../../assets/icons/folder.svg"
import Logout from "../../assets/icons/Logout.svg"

import BuildingIcon from '../../assets/icons/building_icon.svg';

import { setAuthToken } from '../../config/api.js'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SchoolIcon1 from '../../assets/icons/school_icon_1.png';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx';

const ProfilePanel = ({ onClose }) => {
    const navigate = useNavigate();
    const { logout, user, setUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isSchoolListOpen, setIsSchoolListOpen] = useState(false);
    const isParent = user?.roles?.includes('parent') || user?.role?.name === 'parent';

    const getRoleName = (roles) => {
        if (!roles) return 'نقش نامشخص';
        const roleMap = {
            'admin': 'مدیر کل', 'deputy': 'معاون', 'principal': 'مدیر مدرسه',
            'teacher': 'معلم', 'parents': 'والدین', 'parent': 'والدین'
        };
        if (Array.isArray(roles)) {
            return roles.map(role => roleMap[role] || 'نقش نامشخص').join('، ');
        }
        return roleMap[roles] || 'نقش نامشخص';
    };

    const handleLogout = (e) => {
        e.stopPropagation();
        e.preventDefault();
        logout();
    };

    const toggleSchoolList = () => {
        setIsSchoolListOpen(!isSchoolListOpen);
    };

    const handleSelect = useCallback((item) => {
        if (!user) return;
        const isAdmin = user?.role?.name === 'admin';

        const updatedUser = {
            ...user,
            roles: isAdmin ? ["admin"] : item.current_user_roles || (isParent ? ["parent"] : []),
            role: (isAdmin ? ["admin"] : item.current_user_roles || (isParent ? ["parent"] : []))[0] || null,
            selectedSchool: isParent ? item.active_enrollment?.class?.school?.id : item.id,
            school_id: isParent ? item.active_enrollment?.class?.school?.id : item.id,
            selected_child: isParent ? item : null,
            selected_child_id: isParent ? item.id : null,
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSelectedItemId(item.id);

        if (updatedUser.roles && updatedUser.roles.length > 0) {
            if (isParent) {
                // navigate('/Parent', { replace: true });
            } else if (updatedUser.roles.includes('teacher')) {
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    // navigate('/hozor', { replace: true });
                }, 1000);
            } else {
                // navigate('/', { replace: true });
            }
        } else {
            console.warn("نقش کاربر تعریف نشده!");
        }
    }, [user, setUser, isParent]);

    useEffect(() => {
        async function fetchData() {
            if (!user?.token) return;
            setLoading(true);

            try {
                setAuthToken(user.token);
                const endpoint = isParent ? endpoints.children : endpoints.schools;
                const response = await api.get(endpoint);
                const data = response.data.data;
                setItems(data);

                // منطق انتخاب خودکار را مستقیماً اینجا اجرا کنید
                // و فقط زمانی اجرا شود که آیتمی از قبل انتخاب نشده باشد
                if (data.length === 1 && !user.selectedSchool && !user.selected_child_id) {
                    handleSelect(data[0]);
                }
            } catch (error) {
                console.error(isParent ? 'خطا در دریافت فرزندان:' : 'خطا در دریافت مدارس:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        // وابستگی به handleSelect حذف شد تا حلقه شکسته شود
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token, isParent]);

    const displayName = user?.profile?.first_name + ' ' + user?.profile?.last_name;
    const currentRole = getRoleName(user?.roles);

    return (
        <div className={styles.profilePanel}>
            {/* Close Icon */}
            <img className={styles.profilePanelIcon} src={CloseIcon} alt='بستن پنل' onClick={onClose} />

            {/* User Profile Info */}
            <div className={styles.profilePanelcont}>
                <img src={profile} alt='عکس پروفایل' className={styles.profilePanelRight} /> {/* Placeholder for user profile image */}
                <div className={styles.profilePanelLeft}>
                    <h2>{displayName}</h2>
                    <p>{user?.profile?.phone_number}</p>
                    <p>{user?.profile?.national_code}</p>
                    <p>{currentRole}</p>
                </div>
            </div>

            {/* Change School Section */}
            <div className={`${styles.profiledrop} `}>
                <div className={`${styles.changeSchoolButton} ${isSchoolListOpen ? styles.open : ''}`} onClick={toggleSchoolList}>
                    <p>{isParent ? 'تغییر فرزند' : 'تغییر آموزشگاه'}</p>
                    <div className={styles.schoolDropdownArrowContainer}>
                        <img
                            src={DropdownArrowUpIcon}
                            alt={isSchoolListOpen ? "بستن لیست" : "باز کردن لیست"}
                            className={isSchoolListOpen ? styles.schoolDropdownArroww : styles.schoolDropdownArrow}
                        />
                    </div>
                    <img src={ChangeSchoolIcon} alt="تغییر" className={styles.changeSchoolIconRight} />
                </div>

                {isSchoolListOpen && (
                    <div className={styles.schoolListContainer}>
                        {loading ? (
                            <Skeleton duration={3} highlightColor="#69b0b2" count={3} style={{ margin: "1px 0", borderRadius: "6px" }} height={50} />
                        ) : items.length === 0 ? (
                            <p>{isParent ? 'فرزندی یافت نشد.' : 'مدرسه‌ای یافت نشد.'}</p>
                        ) : (
                            items.map(item => {
                                const isSelected = item.id === selectedItemId;
                                const itemName = isParent ? `${item.profile.first_name} ${item.profile.last_name}` : item.name;
                                const schoolName = isParent ? item.active_enrollment?.class?.school?.name : item.name;
                                const itemRoles = isParent ? 'فرزند' : item.current_user_roles;

                                return (
                                    <div
                                        key={item.id}
                                        className={`${styles.schoolListItem} ${isSelected ? styles.selectedSchool : ''}`}
                                        onClick={() => handleSelect(item)}
                                    >
                                        <img src={SchoolIcon1} alt={itemName} className={styles.schoolItemIcon} />
                                        <div className={styles.schoolItemInfo}>
                                            <h3>{itemName}</h3>
                                            <div className={styles.schoolItemDetails}>
                                                <p className={styles.schoolType}>
                                                    <img src={BuildingIcon} alt='نوع' /> {schoolName || (isParent ? "مدرسه نامشخص" : "نوع نامشخص")}
                                                </p>
                                                <p className={styles.schoolLocation}>
                                                    {getRoleName(itemRoles)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <div className={styles.profilePaneloptionline} />
            <div className={styles.profilePaneloption} onClick={() => navigate('/EditUser')}>
                <p>ویرایش اطلاعات کاربری</p>
                <svg width="37" height="41" viewBox="0 0 37 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M25.8828 19.1538C31.6844 19.1539 36.3877 23.8571 36.3877 29.6587C36.3875 35.4601 31.6843 40.1635 25.8828 40.1636C20.0813 40.1636 15.3781 35.4602 15.3779 29.6587C15.3779 23.8571 20.0812 19.1538 25.8828 19.1538ZM19.5547 32.7378V35.4048H22.2217L29.6055 28.021L26.9385 25.354L19.5547 32.7378ZM27.9453 24.3472L30.6123 27.0142L32.2217 25.4048L29.5547 22.7378L27.9453 24.3472Z" fill="#69B0B2" />
                    <path d="M15.4316 22.9731C14.194 24.9042 13.4678 27.1948 13.4678 29.6587C13.4679 32.9743 14.7774 35.9776 16.8945 38.2046C16.3961 38.2351 15.8907 38.2534 15.3779 38.2534C6.80988 38.2534 0.0979843 33.9324 0.0976562 28.4165V27.271C0.0976562 24.9016 2.02615 22.9731 4.39551 22.9731H15.4316Z" fill="#69B0B2" />
                    <path d="M15.3779 0.0532227C20.6436 0.0533706 24.9276 4.33739 24.9277 9.60303C24.9277 14.8688 20.6437 19.1537 15.3779 19.1538C10.1121 19.1538 5.82812 14.8689 5.82812 9.60303C5.8283 4.3373 10.1122 0.0532227 15.3779 0.0532227Z" fill="#69B0B2" />
                </svg>
            </div>
            {(user?.roles[0] !== 'teacher' && user?.roles[0] !== 'parent' && user?.roles[0] !== 'deputy-educational' && user?.roles[0] !== 'deputy-executive') && (
                <>
                    <div className={styles.profilePaneloption} onClick={() => navigate('/EditSchool')}>
                        <p>ویرایش اطلاعات مدرسه</p>
                        <img src={AboutSchool} alt="" />
                    </div>
                    <div className={` ${styles.profilePaneloption} ${styles.disable}`}>
                        <p>ورود به بخش بایگانی</p>
                        <img src={Folder} alt="" />
                    </div>
                </>
            )}
            <div className={styles.profilePaneloption} onClick={handleLogout}>
                <p>خروج از حساب کاربری</p>
                <img src={Logout} alt="" />
            </div>
        </div>
    );
};

export default ProfilePanel;