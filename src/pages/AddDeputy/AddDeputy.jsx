import React, { useEffect, useState, useCallback } from 'react';
import style from './AddDeputy.module.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import ShamsiDatePicker from '../../components/Calendar/ShamsiDatePicker';
import api, { endpoints } from '../../config/api';
import calenderIcon from "../../assets/icons/Calender.svg";
import back from '../../assets/icons/back.svg';
import image_preview from '../../assets/icons/image-preview.svg';
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

import { showSuccessNotification, showErrorNotification } from "../../services/notificationService";

// --- START: Helper functions for number conversion ---
// تابعی برای تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (str) => {
    if (str === null || str === undefined) return '';
    const persian = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' };
    return String(str).replace(/[0-9]/g, (w) => persian[w]);
};

// تابعی برای تبدیل اعداد فارسی به انگلیسی
const toEnglishDigits = (str) => {
    if (str === null || str === undefined) return '';
    const english = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
    return String(str).replace(/[۰-۹]/g, (w) => english[w]);
};
// --- END: Helper functions for number conversion ---


// --- Modal Component Definition ---
const Modal = ({
    isOpen, onClose, Data, step,
    onSendOtp, onVerifyOtp, isSendingOtp, isVerifyingOtp,
    otpValue, onOtpChange, otpError
}) => {
    if (!isOpen) return null;

    const maskPhoneNumber = (phone) => {
        if (!phone || phone.length < 11) return 'شماره نامعتبر';
        return toPersianDigits(`${phone.substring(0, 4)}***${phone.substring(7)}`);
    };

    return (
        <div className={style.modalOverlay}>
            <div className={style.modal}>
                <div className={style.modalback} onClick={onClose}>
                    <img src={back} alt="بازگشت" />
                    <p>بازگشت</p>
                </div>

                {step === 'initialInfo' && (
                    <>
                        <h1 style={{marginTop:"45px"}}>کد ملی ای که وارد کرده اید، در سامانه موجود است</h1>
                        <p className={style.modalinfo}>اطلاعات زیر متعلق به این کد ملی است. برای ادامه، شماره تماس را تایید کنید.</p>
                        {/* <div className={style.modalContent}>
                            <p><strong>نام:</strong> {Data?.first_name}</p>
                            <p><strong>نام خانوادگی:</strong> {Data?.last_name}</p>
                            <p><strong>شماره تماس:</strong> {maskPhoneNumber(Data?.phone_number)}</p>
                            <button className={style.accept} onClick={onSendOtp} disabled={isSendingOtp}>
                                {isSendingOtp ? 'در حال ارسال کد...' : 'ارسال کد تایید'}
                            </button>
                        </div> */}
                    </>
                )}

                {step === 'otpVerification' && (
                    <>
                        <h1>شماره تماس خود را تایید کنید!</h1>
                        <p className={style.modalinfo}>کد ۶ رقمی ارسال شده به {maskPhoneNumber(Data?.phone_number)} را وارد کنید!</p>
                        <div className={style.otpContainer}>
                            <input
                                type="tel" // Use "tel" for numeric keyboard on mobile
                                className={style.otpInput}
                                value={toPersianDigits(otpValue)} // Display in Persian
                                onChange={onOtpChange}
                                maxLength="6"
                                placeholder="------"
                            />
                            {otpError && <div className={style.error}>{otpError}</div>}
                        </div>
                        <div className={style.modalActions}>
                            <button className={style.resendButton} onClick={onSendOtp}>ارسال مجدد</button>
                            <button className={style.verifyButton} onClick={onVerifyOtp} disabled={isVerifyingOtp}>
                                {isVerifyingOtp ? 'در حال بررسی...' : 'تایید'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Main AddDeputy Component ---
export default function AddDeputy() {
    const navigate = useNavigate();
    const { deputyid } = useParams();
    const isEditMode = !!deputyid;

    // --- State Management ---
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [showLayer, setShowLayer] = useState(false);
    const [isLocked, setIsLocked] = useState(!isEditMode);
    const [isCheckingNationalCode, setIsCheckingNationalCode] = useState(false);
    const [nationalCodeApiError, setNationalCodeApiError] = useState(null);
    const [pageLoading, setPageLoading] = useState(isEditMode);

    // --- States for Modal and OTP flow ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState('initialInfo');
    const [existingUserData, setExistingUserData] = useState(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState(null);

    // Dropdown visibility
    const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
    const [specialtyDropdownVisible, setSpecialtyDropdownVisible] = useState(false);
    const [selectedGender, setSelectedGender] = useState("آقا");
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);

    // API and Submission states
    const [specialties, setSpecialties] = useState([]);
    const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Date picker visibility
    const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

    // --- Form State ---
    const initialFormData = {
        firstName: '', lastName: '', personnelCode: '', nationalCode: '',
        username: '', password: '',
        passwordConfirm: '', birthDate: '', phoneNumber: '', startDate: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // --- Form Fields Definition ---
    const nationalCodeField = { name: 'nationalCode', label: 'کد ملی', required: true };
    const fields = [
        { name: 'firstName', label: 'نام', required: true },
        { name: 'lastName', label: 'نام خانوادگی', required: true },
        { name: 'personnelCode', label: 'کد پرسنلی', required: true },
        { name: 'phoneNumber', label: 'شماره تلفن', required: true },
    ];
    const fields2 = [
        { name: 'username', label: 'نام کاربری', required: true },
        { name: 'password', label: 'رمز عبور', required: !isEditMode, type: 'password' },
        { name: 'passwordConfirm', label: 'تکرار رمز عبور', required: !isEditMode, type: 'password' },
    ];
    // --- START: MODIFIED CODE ---
    // لیست فیلدهایی که باید فقط عدد قبول کنند
    const numericFields = ['nationalCode', 'personnelCode', 'phoneNumber'];
    // --- END: MODIFIED CODE ---

    // --- Validation Logic ---
    const validate = useCallback(() => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'ضروری';
        if (!formData.lastName) newErrors.lastName = 'ضروری';
        if (!formData.personnelCode) newErrors.personnelCode = 'ضروری';
        if (!formData.nationalCode) {
            newErrors.nationalCode = 'ضروری';
        } else if (formData.nationalCode.length !== 10) {
            newErrors.nationalCode = 'کد ملی باید ۱۰ رقم باشد';
        }
       

        if (!formData.birthDate) newErrors.birthDate = 'ضروری';
        if (!formData.startDate) newErrors.startDate = 'ضروری';

        return newErrors;
    }, [formData, isEditMode]);

    // --- API call to check if national code exists ---
    const checkNationalCode = useCallback(async (nationalCode) => {
        if (nationalCode.length !== 10 || isEditMode) return;

        setIsCheckingNationalCode(true);
        setNationalCodeApiError(null);
        setIsLocked(true);

        try {
            const response = await api.get(`${endpoints.getinfos(nationalCode)}&entity_type=deputy`);
            if (response.data && (response.data.data.entity_exists || response.data.data.profile_exists)) {
                setExistingUserData(response.data.data.profile_data);
                setModalStep('initialInfo');
                setIsModalOpen(true);
            } else {
                setIsLocked(false);
            }
        } catch (err) {
            if (err.response && err.response.status === 404 || (err.response && !err.response.data.data.entity_exists && !err.response.data.data.profile_exists)) {
                setIsLocked(false);
                setNationalCodeApiError(null);
            } else {
                setNationalCodeApiError('خطا در استعلام کد ملی. لطفا اتصال خود را بررسی کنید.');
                setIsLocked(true);
                console.error("Error checking national code:", err);
            }
        } finally {
            setIsCheckingNationalCode(false);
        }
    }, [isEditMode]);

    // --- Form Handlers ---
    // --- START: MODIFIED handleChange ---
    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;

        // اگر فیلد جزو فیلدهای عددی بود، مقدار را به انگلیسی تبدیل کن
        // و کاراکترهای غیرعددی را حذف کن
        if (numericFields.includes(name)) {
            value = toEnglishDigits(value);
            if (!/^\d*$/.test(value)) {
                return; // اگر کاربر چیزی غیر از عدد وارد کرد، ورودی را نادیده بگیر
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (name === 'nationalCode') {
            setNationalCodeApiError(null);
            if (value.length < 10) {
                setIsLocked(true);
            }
            if (value.length === 10) {
                setErrors(prevErrors => ({ ...prevErrors, nationalCode: null }));
                checkNationalCode(value);
            }
        }
    };
    // --- END: MODIFIED handleChange ---

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    useEffect(() => { setErrors(validate()); }, [formData, validate]);

    // --- Handlers for the OTP Modal ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setExistingUserData(null);
        setOtpValue('');
        setOtpError(null);
        setModalStep('initialInfo');
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        setOtpError(null);
        try {
            await api.post(endpoints.sendOtp(), {
                national_code: existingUserData.national_code
            });
            setModalStep('otpVerification');
        } catch (err) {
            console.error("Error sending OTP:", err.response || err);
            setOtpError("خطا در ارسال کد تایید. لطفا دوباره تلاش کنید.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.length !== 6) {
            setOtpError("کد تایید باید ۶ رقم باشد.");
            return;
        }
        setIsVerifyingOtp(true);
        setOtpError(null);
        try {
            await api.post(endpoints.verifyOtp(), {
                national_code: existingUserData.national_code,
                otp: otpValue
            });
            setFormData(prev => ({
                ...prev,
                firstName: existingUserData.first_name || '',
                lastName: existingUserData.last_name || '',
                phoneNumber: existingUserData.phone_number || '',
            }));
            setIsLocked(false);
            handleCloseModal();
        } catch (error) {
            console.error("Error verifying OTP:", error.response || error);
            setOtpError("کد وارد شده صحیح نیست یا منقضی شده است.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // --- START: MODIFIED handleOtpChange ---
    const handleOtpChange = (e) => {
        const value = toEnglishDigits(e.target.value); // ورودی را به انگلیسی تبدیل کن
        // فقط اعداد را قبول کن
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtpValue(value); // مقدار انگلیسی را در state ذخیره کن
            if (otpError) setOtpError(null);
        }
    };
    // --- END: MODIFIED handleOtpChange ---


    // --- START: Added Code ---
    // این متد جدید برای آپلود تصویر پروفایل است
    const uploadProfileImage = async (id) => {
        // اگر فایلی برای آپلود انتخاب نشده باشد، تابع کاری انجام نمی‌دهد
        if (!imageFile) {
            return;
        }

        // یک آبجکت FormData برای ارسال فایل ساخته می‌شود
        const imageFormData = new FormData();
        imageFormData.append('profile_image', imageFile); // 'profile_image' کلیدی است که بک‌اند انتظار دارد

        try {
            // یک درخواست POST به اندپوینت مربوط به آپلود تصویر ارسال می‌شود
            // این اندپوینت باید در فایل کانفیگ api شما تعریف شده باشد
            // مثال: deputyProfileImage: (id) => `/deputies/${id}/profile-image/`
            await api.post(endpoints.deputyProfileImage(id), imageFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (err) {
            console.error("خطا در آپلود تصویر پروفایل:", err);
            // در صورت بروز خطا، یک نوتیفیکیشن به کاربر نمایش داده می‌شود
            showErrorNotification("اطلاعات متنی با موفقیت ذخیره شد، اما آپلود تصویر با خطا مواجه شد.");
        }
    };
    // --- END: Added Code ---

    // --- Form Submission ---
   // --- Form Submission ---
const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    setErrors({});
    setTouched({
        firstName: true, lastName: true, personnelCode: true, nationalCode: true,
        phoneNumber: true, username: true, password: true,
        passwordConfirm: true, birthDate: true, startDate: true
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    if (nationalCodeApiError && !isEditMode) {
        return;
    }
    if (!selectedSpecialty) {
        showErrorNotification("لطفاً تخصص معاون را انتخاب کنید.");
        return;
    }

    setIsSubmitting(true);
    
    const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        personnel_code: formData.personnelCode,
        national_code: formData.nationalCode,
        gender: selectedGender === 'خانم' ? 'female' : 'male',
        birth_date: formData.birthDate,
        phone_number: formData.phoneNumber,
      
        start_date: formData.startDate,
        role_id: selectedSpecialty.id
    };
       const user = {
           username: formData.username,
       }
         const profile = {
            national_code: formData.nationalCode,
        gender: selectedGender === 'خانم' ? 'female' : 'male',
        birth_date: formData.birthDate,
        phone_number: formData.phoneNumber,
        start_date: formData.startDate,
        role_id: selectedSpecialty.id,
         first_name: formData.firstName,
        last_name: formData.lastName,
       }
       const deputy = {
            personnel_code: formData.personnelCode,
       }
     const editpayload = {
       profile,
       user,
       deputy
      
    };

    if (formData.password) {
        user.password = formData.password;
    }

    try {
        let submittedDeputyId = deputyid;

        if (isEditMode) {
            await api.put(endpoints.updatedeputy(deputyid), editpayload);
        } else {
            const response = await api.post(endpoints.deputy(), payload);
            if (response.data && response.data.data && response.data.data.id) {
                submittedDeputyId = response.data.data.id;
            } else {
                showErrorNotification("کاربر با موفقیت ثبت شد اما آیدی برای آپلود تصویر دریافت نشد.");
                setIsSubmitting(false);
                return;
            }
        }

        if (imageFile && submittedDeputyId) {
            await uploadProfileImage(submittedDeputyId);
        }

        setSubmitSuccess(true);
        showSuccessNotification("ثبت موفق بود!");
        setSubmitError(null);
        navigate(-1)

    } catch (err) {
        console.error("Submission Error Response:", err.response || err);
        if (err.response && err.response.data) {
            const { message, errors: apiErrors } = err.response.data;
            setSubmitError(message || "اطلاعات وارد شده معتبر نیست.");
            if (apiErrors) {
                // --- START: MODIFIED CODE ---
                // به صورت خاص خطای مربوط به role_id را بررسی و با نوتیفیکیشن نمایش می‌دهیم
                if (apiErrors.role_id && apiErrors.role_id.length > 0) {
                    showErrorNotification(apiErrors.role_id[0]);
                    // بعد از نمایش خطا، آن را از لیست خطاها حذف می‌کنیم تا دوباره پردازش نشود
                    delete apiErrors.role_id;
                }
                // --- END: MODIFIED CODE ---

                const formErrors = {};
                const fieldMap = {
                    national_code: 'nationalCode', first_name: 'firstName',
                    last_name: 'lastName', personnel_code: 'personnelCode',
                    phone_number: 'phoneNumber', start_date: 'startDate',
                    username: 'username', password: 'password', birth_date: 'birthDate',
                };
                for (const serverField in apiErrors) {
                    const formField = fieldMap[serverField] || serverField;
                    if (apiErrors[serverField] && apiErrors[serverField].length > 0) {
                        formErrors[formField] = apiErrors[serverField][0];
                    }
                }
                setErrors(prev => ({ ...prev, ...formErrors }));
            }
        } else {
            showErrorNotification("خطایی در ارتباط با سرور رخ داد. لطفاً بعداً تلاش کنید.");
        }
    } finally {
        setIsSubmitting(false);
    }
};

    // --- Data Fetching Effect for Specialties and Deputy Info ---
    // --- Data Fetching Effect for Specialties and Deputy Info ---
    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                const rolesResponse = await api.get(endpoints.getroles());
                if (isMounted) {
                    // فیلتر کردن نقش‌ها بر اساس فیلد 'name' که حاوی 'deputy' است
                    const deputyRoles = rolesResponse.data.data.filter(role => role.name.includes('deputy'));
                    setSpecialties(deputyRoles);

                    if (isEditMode) {
                        const deputyResponse = await api.get(endpoints.addeputy(deputyid));
                        const deputyData = deputyResponse.data.data;

                        setFormData({
                            firstName: deputyData.profile.first_name || '',
                            lastName: deputyData.profile.last_name || '',
                            personnelCode: deputyData.personnel_code || '',
                            nationalCode: deputyData.profile.national_code || '',
                            username: deputyData.profile.user.username || '',
                            password: '',
                            passwordConfirm: '',
                            birthDate: deputyData.profile.birth_date || '',
                            phoneNumber: deputyData.profile.phone_number || '',
                            startDate: deputyData.active_employment.start_date || '',
                        });

                        setSelectedGender(deputyData.profile.gender === 'female' ? 'خانم' : 'آقا');

                        // --- START: MODIFIED CODE ---
                        // این بخش برای پیدا کردن و تنظیم نوع معاونت فعلی ویرایش شده است
                        // بر اساس ساختار جدید JSON، ما به ID نقش از مسیر زیر دسترسی داریم
                        if (deputyData.active_employment && deputyData.active_employment.role) {
                            const currentRoleId = deputyData.active_employment.role.id;
                            const currentRole = deputyRoles.find(role => role.id === currentRoleId);
                            if (currentRole) {
                                setSelectedSpecialty(currentRole);
                            }
                        }
                        // --- END: MODIFIED CODE ---

                        if (deputyData.profile.profile_image_url) { // فرض بر اینکه URL تصویر در این مسیر است
                            setImagePreview(deputyData.profile.profile_image_url);
                            setShowLayer(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                showErrorNotification(isEditMode ? "خطا در دریافت اطلاعات معاون" : "خطا در دریافت لیست تخصص‌ها");
            } finally {
                if (isMounted) {
                    setSpecialtiesLoading(false);
                    setPageLoading(false);
                }
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [isEditMode, deputyid]); // navigate از وابستگی‌ها حذف شد چون استفاده نمی‌شود


    // --- Helper Functions ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size / 1024 > 500) {
                alert("حجم تصویر نباید بیشتر از ۵۰۰ کیلوبایت باشد.");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setShowLayer(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDateSelect = (date, fieldName) => {
        const formattedDate = date.format('YYYY/MM/DD');
        setFormData(prev => ({ ...prev, [fieldName]: formattedDate }));
        if (fieldName === 'birthDate') setIsBirthDatePickerOpen(false);
        if (fieldName === 'startDate') setIsStartDatePickerOpen(false);
    };

    if (pageLoading) {
        return (
            <div className='Dashboard'>
                <Header />
                <div className='App-Container'>
                    <Sidebar />
                    <div className='Main-Content' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <LoadingSpinner />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='Dashboard'>
            <Header />
            <div className='App-Container'>
                <Sidebar />
                <div className='Main-Content' id='main'>
                    <Modal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        Data={existingUserData}
                        step={modalStep}
                        onSendOtp={handleSendOtp}
                        onVerifyOtp={handleVerifyOtp}
                        isSendingOtp={isSendingOtp}
                        isVerifyingOtp={isVerifyingOtp}
                        otpValue={otpValue}
                        onOtpChange={handleOtpChange}
                        otpError={otpError}
                    />

                    <div className={style.container}>
               
                        <div className={style.inputs_container}>
                            <form onSubmit={handleSubmit} className={style.form_style} noValidate>
                                <div className={style.inputs}>
                                     <div className={style.inputcontainer} style={{display: 'flex', flexDirection: 'row-reverse',justifyContent: 'end',alignItems: 'center',width: '100%'}}>
                                    {isCheckingNationalCode && <div className={style.loading_text}><LoadingSpinner /></div>}
                                    <input
                                        className={style.txt_inp}
                                        id={nationalCodeField.name}
                                        name={nationalCodeField.name}
                                        type={'tel'} // Use "tel" for numeric keyboard on mobile
                                        value={toPersianDigits(formData[nationalCodeField.name])} // Display in Persian
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength="10"
                                        placeholder="ابتدا کد ملی ۱۰ رقمی را وارد کنید"
                                        disabled={isCheckingNationalCode || isEditMode}
                                    />
                                    <label htmlFor={nationalCodeField.name} className={style.txt_lbl}>
                                        {nationalCodeField.required && <span style={{ color: 'red' }}>* </span>}
                                        {nationalCodeField.label}:
                                    </label>
                                    </div>
                                    {(touched[nationalCodeField.name] && errors[nationalCodeField.name]) && (
                                        <div className={style.error}>{errors[nationalCodeField.name]}</div>
                                    )}

                                    {nationalCodeApiError && <div className={style.error}>{nationalCodeApiError}</div>}
                                    
                                </div>
                                

                                {fields.map((field, index) => (
                                    <React.Fragment key={field.name}>
                                        <div className={`${style.inputs} ${isLocked ? style.section_locked : ''}`}>
                                             <div className={style.inputcontainer} style={{display: 'flex', flexDirection: 'row-reverse',justifyContent: 'end',alignItems: 'center',width: '100%'}}>
                                            <input
                                                className={style.txt_inp}
                                                id={field.name}
                                                name={field.name}
                                                // --- START: MODIFIED ---
                                                // برای فیلدهای شماره تلفن و کد پرسنلی کیبورد عددی نمایش بده
                                                type={numericFields.includes(field.name) ? 'tel' : (field.type || 'text')}
                                                // اگر فیلد عددی بود به فارسی نمایش بده، در غیر این صورت خود مقدار را نشان بده
                                                value={numericFields.includes(field.name) ? toPersianDigits(formData[field.name]) : formData[field.name]}
                                                // --- END: MODIFIED ---
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                disabled={isLocked}
                                            />
                                            <label htmlFor={field.name} className={style.txt_lbl}>
                                                {field.required && <span style={{ color: 'red' }}>* </span>}
                                                {field.label}:
                                            </label>
                                            </div>
                                            {(touched[field.name] && errors[field.name]) && (
                                                <div className={style.error}>{errors[field.name]}</div>
                                            )}
                                            
                                        </div>
                                        
                                    </React.Fragment>
                                ))}

                                <div className={`${style.dropdown_container} ${isLocked ? style.section_locked : ''}`}>
                                    <div className={style.dropdown_expect_txt} onClick={!isLocked ? () => setGenderDropdownVisible(prev => !prev) : undefined}>
                                        <div className={style.displayBox}>{selectedGender}</div>
                                        <div className={style.arrowBox}>
                                            <svg className={`${style.arrow} ${genderDropdownVisible ? style.rotate : ''}`} viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="#69b0b2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className={style.dropdown_txt}>
                                        <p className={style.dropdown_title}>:جنسیت</p>
                                    </div>
                                    <div className={`${style.dropdownMenu} ${genderDropdownVisible ? style.show : style.hide}`}>
                                        <div className={style.dropdownItem} onMouseDown={() => { setSelectedGender("خانم"); setGenderDropdownVisible(false); }}>خانم</div>
                                        <div className={style.dropdownItem} onMouseDown={() => { setSelectedGender("آقا"); setGenderDropdownVisible(false); }}>آقا</div>
                                    </div>
                                </div>

                                <div className={`${style.birthDateWrapper} ${isLocked ? style.section_locked : ''}`}>
                                    <label className={style.label}> <span style={{ color: 'red' }}>* </span>تاریخ تولد:</label>
                                    <div className={style.dropdown_expect_txt}>
                                        <div className={style.inputWithIcon}>
                                            <input type="text" readOnly value={toPersianDigits(formData.birthDate)} placeholder="انتخاب کنید" className={style.date_inp} onClick={!isLocked ? () => setIsBirthDatePickerOpen(true) : undefined} />
                                            {touched.birthDate && errors.birthDate && <div className={style.error}>{errors.birthDate}</div>}
                                        </div>
                                        <div className={style.calendarPopup}>
                                            <img className={style.calendarPopupicon} src={calenderIcon} onClick={!isLocked ? () => setIsBirthDatePickerOpen(prev => !prev) : undefined} alt='calendar-icon' />
                                            {isBirthDatePickerOpen && <ShamsiDatePicker isOpen={isBirthDatePickerOpen} onClose={() => setIsBirthDatePickerOpen(false)} onSelectDate={(date) => handleDateSelect(date, 'birthDate')} />}
                                        </div>
                                    </div>
                                </div>

                                <div className={`${style.dropdown_container} ${isLocked ? style.section_locked : ''}`}>
                                    <div className={style.dropdown_expect_txt} onClick={!isLocked ? () => setSpecialtyDropdownVisible(prev => !prev) : undefined}>
                                        {/* ویرایش شده: نمایش فیلد 'code' برای نام تخصص */}
                                        <div className={style.displayBox}>{selectedSpecialty?.code || "انتخاب کنید"}</div>
                                        <div className={style.arrowBox}>
                                            <svg className={`${style.arrow} ${specialtyDropdownVisible ? style.rotate : ''}`} viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="#69b0b2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className={style.dropdown_txt}>
                                        <p className={style.dropdown_title}><span style={{ color: 'red' }}>* </span>:نوع معاونت</p>
                                    </div>
                                    <div className={`${style.dropdownMenu} ${specialtyDropdownVisible ? style.show : style.hide}`}>
                                        {specialtiesLoading ? <div className={style.dropdownItem}>در حال بارگذاری...</div> :
                                            specialties.map(spec => (
                                                <div key={spec.id} className={style.dropdownItem} onMouseDown={() => { setSelectedSpecialty(spec); setSpecialtyDropdownVisible(false); }}>
                                                    {/* ویرایش شده: نمایش فیلد 'code' برای نام تخصص در لیست */}
                                                    {spec.code}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className={`${style.birthDateWrapper} ${isLocked ? style.section_locked : ''}`}>
                                    <label className={style.label}><span style={{ color: 'red' }}>* </span>تاریخ شروع همکاری:</label>
                                    <div className={style.dropdown_expect_txt}>
                                        <div className={style.inputWithIcon}>
                                            <input type="text" readOnly value={toPersianDigits(formData.startDate)} placeholder="انتخاب کنید" className={style.date_inp} onClick={!isLocked ? () => setIsStartDatePickerOpen(true) : undefined} />
                                            {touched.startDate && errors.startDate && <div className={style.error}>{errors.startDate}</div>}
                                        </div>
                                        <div className={style.calendarPopup}>
                                            <img src={calenderIcon} className={style.calendarPopupicon} onClick={!isLocked ? () => setIsStartDatePickerOpen(prev => !prev) : undefined} alt='calendar-icon' />
                                            {isStartDatePickerOpen && <ShamsiDatePicker isOpen={isStartDatePickerOpen} onClose={() => setIsStartDatePickerOpen(false)} onSelectDate={(date) => handleDateSelect(date, 'startDate')} />}
                                        </div>
                                    </div>
                                </div>

                                {/* --- START: MODIFIED CODE --- */}
                                {/* این بخش فقط زمانی نمایش داده می‌شود که در حالت ویرایش باشیم */}
                                {isEditMode && fields2.map((field, index) => (
                                    <React.Fragment key={field.name}>
                                        <div className={`${style.inputs} ${isLocked ? style.section_locked : ''}`}>
                                             <div className={style.inputcontainer} style={{display: 'flex', flexDirection: 'row-reverse',justifyContent: 'end',alignItems: 'center',width: '100%'}}>
                                            <input
                                                className={style.txt_inp}
                                                id={field.name}
                                                name={field.name}
                                                type={field.type || 'text'}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                disabled={isLocked}
                                                placeholder={isEditMode && field.type === 'password' ? 'برای تغییر، رمز عبور جدید را وارد کنید' : ''}
                                            />
                                            <label htmlFor={field.name} className={style.txt_lbl}>
                                                {field.required && <span style={{ color: 'red' }}>* </span>}
                                                {field.label}:
                                            </label>
                                            </div>
                                            {(touched[field.name] && errors[field.name]) && (
                                                <div className={style.error}>{errors[field.name]}</div>
                                            )}
                                        </div>
                                        {index !== fields2.length - 1 && <div className={style.spacer}></div>}
                                    </React.Fragment>
                                ))}
                                {/* --- END: MODIFIED CODE --- */}
                            </form>
                        </div>

                        <div className={style.image_and_submit_container}>
                            <div className={`${style.image_picker} ${isLocked ? style.section_locked : ''}`}>
                                <label className={style.the_picker} >
                                    <div className={`${style.picker_content} ${imagePreview ? style.hide : ''}`}>
                                        <img src={image_preview} alt="pin" className={style.picker_icon} />
                                        <p className={style.picker_text}>افزودن تصویر</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden disabled={isLocked} />
                                    {imagePreview && (
                                        <div className={`${style.preview_keeper} ${showLayer ? style.show : ''}`}>
                                            <img src={imagePreview} alt="Preview" className={`${style.img_preview} ${showLayer ? style.show : ''}`} />
                                        </div>
                                    )}
                                </label>
                            </div>

                            
                            <button
                                type="submit"
                                className={style.submit_btn}
                                disabled={isSubmitting || isLocked}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? (isEditMode ? <LoadingSpinner /> : <LoadingSpinner />) : (isEditMode ? 'ثبت تغییرات' : 'تایید و ثبت نام معاون')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
