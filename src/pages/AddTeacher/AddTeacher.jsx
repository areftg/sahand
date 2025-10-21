import React, { useEffect, useState, useCallback } from 'react';
import style from './AddTeacher.module.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import ShamsiDatePicker from '../../components/Calendar/ShamsiDatePicker';
import api, { endpoints } from '../../config/api';
import calenderIcon from "../../assets/icons/Calender.svg";

import image_preview from '../../assets/icons/image-preview.svg';
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { showSuccessNotification, showErrorNotification } from "../../services/notificationService";

import BackButton from '../../components/BackButton/BackButton';

// --- Helper functions for number conversion ---
const toPersianDigits = (str) => {
    if (str === null || str === undefined) return '';
    const persian = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' };
    return String(str).replace(/[0-9]/g, (w) => persian[w]);
};

const toEnglishDigits = (str) => {
    if (str === null || str === undefined) return '';
    const english = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
    return String(str).replace(/[۰-۹]/g, (w) => english[w]);
};

// --- Main AddTeacher Component ---
export default function AddTeacher() {
    const navigate = useNavigate();
    const { teacherId } = useParams();
    let isEditMode = !!teacherId;
   

    // --- State Management ---
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [showLayer, setShowLayer] = useState(false);
    const [isLocked, setIsLocked] = useState(!isEditMode);
    const [isCheckingNationalCode, setIsCheckingNationalCode] = useState(false);
    const [nationalCodeApiError, setNationalCodeApiError] = useState(null);
    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [prefilledFields, setPrefilledFields] = useState([]);
    const [apiRequiredFields, setApiRequiredFields] = useState([]);

    // Dropdown visibility
    const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
    const [selectedGender, setSelectedGender] = useState("آقا");

    // API and Submission states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Date picker visibility
    const [isBirthDatePickerOpen, setIsBirthDatePickerOpen] = useState(false);
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

    // --- Form State ---
    const initialFormData = {
        firstName: '', lastName: '', personnelCode: '', nationalCode: '',
        phoneNumber: '', education: '', specialty: '',
        username: '', password: '', passwordConfirm: '',
        birthDate: '', startDate: '',
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
        { name: 'phonenumber', label: 'شماره تماس', required: true },
        { name: 'education', label: 'تحصیلات', required: true },
        { name: 'specialty', label: 'تخصص', required: true },
    ];
    const fields2 = [
        { name: 'username', label: 'نام کاربری', required: true },
        { name: 'password', label: 'رمز عبور', required: !isEditMode, type: 'password' },
        { name: 'passwordConfirm', label: 'تکرار رمز عبور', required: !isEditMode, type: 'password' },
    ];
    const numericFields = ['nationalCode', 'personnelCode', 'phonenumber'];

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
        if (!formData.phonenumber) newErrors.phonenumber = 'ضروری';
        if (!formData.education) newErrors.education = 'ضروری';
       
        
        if (isEditMode) {
            if (!formData.username) newErrors.username = 'ضروری';
            if (formData.password || formData.passwordConfirm) {
                if (!formData.password) {
                    newErrors.password = 'ضروری';
                } else if (formData.password.length < 6) {
                    newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
                }
                if (formData.password !== formData.passwordConfirm) {
                    newErrors.passwordConfirm = 'رمزهای عبور یکسان نیستند';
                }
            }
        }
        return newErrors;
    }, [formData, isEditMode]);

    // --- API call to check if national code exists ---
    const checkNationalCode = useCallback(async (nationalCode) => {
        if (nationalCode.length !== 10 || isEditMode) return;
        
        setIsCheckingNationalCode(true);
        setNationalCodeApiError(null);
        setPrefilledFields([]);
        setApiRequiredFields([]);
        setIsLocked(true);

        try {
            const response = await api.get(`${endpoints.getinfos(nationalCode)}&entity_type=teacher`);
            if (response.data && response.data.data) {
                const { entity_exists, profile_exists, profile_data, required_fields } = response.data.data;

                if (entity_exists) {
                    setNationalCodeApiError('کاربر با این کد ملی قبلا به عنوان معلم ثبت شده است.');
                    setIsLocked(true);
                }
                else if (profile_exists) {
                    showSuccessNotification("پروفایل کاربر یافت شد. لطفاً اطلاعات تکمیلی را وارد کنید.");
                    
                    setApiRequiredFields(required_fields || []);
                    
                    setFormData(prev => ({
                        ...prev,
                        firstName: profile_data.first_name || '',
                        lastName: profile_data.last_name || '',
                        phonenumber: profile_data.phone_number || '',
                        birthDate: profile_data.birth_date || '',
                    }));
                    
                    const fieldMap = { personnel_code: 'personnelCode', specialty: 'specialty', education: 'education' };
                    const requiredFieldsForm = (required_fields || []).map(field => fieldMap[field] || field);
                    const allProfileFields = ['firstName', 'lastName', 'phone_number', 'birthDate', 'gender'];
                    const fieldsToDisable = allProfileFields.filter(field => !requiredFieldsForm.includes(field));
                    
                    setPrefilledFields(fieldsToDisable);
                    setIsLocked(false);
                }
                else {
                    setIsLocked(false);
                }
            } else {
                setIsLocked(false);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setIsLocked(false);
                setNationalCodeApiError(null);
            } else {
                setNationalCodeApiError('خطا در استعلام کد ملی. لطفا اتصال خود را بررسی کنید.');
                setIsLocked(true);
            }
        } finally {
            setIsCheckingNationalCode(false);
        }
    }, [isEditMode]);

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { name, value: rawValue } = e.target;
        let value = rawValue;

        if (numericFields.includes(name)) {
            value = toEnglishDigits(value);
            if (!/^\d*$/.test(value)) {
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        if (name === 'nationalCode') {
            setNationalCodeApiError(null);
            setPrefilledFields([]);
            setApiRequiredFields([]);
            if (value.length < 10) {
                setIsLocked(true);
            }
            if (value.length === 10) {
                setErrors(prevErrors => ({ ...prevErrors, nationalCode: null }));
                checkNationalCode(value);
            }
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    useEffect(() => { setErrors(validate()); }, [formData, validate]);
    
    // --- Image Upload Logic ---
    const uploadProfileImage = async (id) => {
        if (!imageFile) return;
        const imageFormData = new FormData();
        imageFormData.append('profile_image', imageFile);
        try {
            await api.post(endpoints.teacherProfileImage(id), imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (err) {
            console.error("خطا در آپلود تصویر پروفایل:", err);
            showErrorNotification("اطلاعات متنی با موفقیت ذخیره شد، اما آپلود تصویر با خطا مواجه شد.");
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitError(null);
        setErrors({});
        setTouched({
            firstName: true, lastName: true, personnelCode: true, nationalCode: true,
            phonenumber: true, education: true, specialty: true, username: true,
            password: true, passwordConfirm: true, birthDate: true, startDate: true
        });

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        if (nationalCodeApiError && !isEditMode) { return; }

        setIsSubmitting(true);

        const fullPayload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            personnel_code: formData.personnelCode,
            national_code: formData.nationalCode,
            gender: selectedGender === 'خانم' ? 'female' : 'male',
            birth_date: formData.birthDate,
            phone_number: formData.phonenumber,
            education: formData.education,
            username: formData.username,
            password: formData.password,
            start_date: formData.startDate,
            specialty: formData.specialty,
        };
        
        let payload = { ...fullPayload };

        if (apiRequiredFields.length > 0 && !isEditMode) {
            const requiredApiFields = new Set(apiRequiredFields);
            requiredApiFields.add('national_code');
            requiredApiFields.add('gender'); 
            requiredApiFields.add('start_date');
            requiredApiFields.add("phone_number");

            payload = Object.keys(fullPayload).reduce((acc, key) => {
                if (requiredApiFields.has(key)) {
                    acc[key] = fullPayload[key];
                }
                return acc;
            }, {});
        }
        
        if (isEditMode && formData.password) {
            payload.password = formData.password;
        } else if (isEditMode) {
            delete payload.password;
        } else if (!isEditMode && formData.password){
            payload.password = formData.password
        }
        
        try {
            let submittedTeacherId = teacherId;

            if (isEditMode) {
                await api.put(endpoints.getteachers(teacherId), payload);
            } else {
                const response = await api.post(endpoints.teachers(), payload);
                if (response.data?.data?.id) {
                    submittedTeacherId = response.data.data.id;
                } else {
                    showErrorNotification("کاربر با موفقیت ثبت شد اما آیدی برای آپلود تصویر دریافت نشد.");
                    setIsSubmitting(false);
                    return;
                }
            }

            if (imageFile && submittedTeacherId) {
                await uploadProfileImage(submittedTeacherId);
            }

            showSuccessNotification(isEditMode ? "تغییرات با موفقیت ثبت شد!" : "ثبت موفق بود!");
            navigate(-1);

        } catch (err) {
            console.error("Submission Error Response:", err.response || err);
            if (err.response && err.response.data) {
                const { message, errors: apiErrors } = err.response.data;
                setSubmitError(message || "اطلاعات وارد شده معتبر نیست.");
                if (apiErrors) {
                    const formErrors = {};
                    const fieldMap = {
                        national_code: 'nationalCode', first_name: 'firstName',
                        last_name: 'lastName', personnel_code: 'personnelCode',
                        phone_number: 'phonenumber', start_date: 'startDate',
                        username: 'username', password: 'password', birth_date: 'birthDate',
                        education: 'education', specialty: 'specialty'
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

    // --- Data Fetching Effect ---
    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                if (isEditMode && isMounted) {
                    const teacherResponse = await api.get(endpoints.getteachers(teacherId));
                    const teacherData = teacherResponse.data.data;
                    setFormData({
                        firstName: teacherData.profile.first_name || '',
                        lastName: teacherData.profile.last_name || '',
                        personnelCode: teacherData.personnel_code || '',
                        nationalCode: teacherData.profile.national_code || '',
                        username: teacherData.profile.user.username || '',
                        password: '',
                        passwordConfirm: '',
                        birthDate: teacherData.profile.birth_date || '',
                        phonenumber: teacherData.profile.phone_number || '',
                        startDate: teacherData.start_date || '',
                        education: teacherData.education || '',
                        specialty: teacherData.specialty?.name || ''
                    });
                    setSelectedGender(teacherData.profile.gender === 'female' ? 'خانم' : 'آقا');
                    if (teacherData.profile.profile_image_url) {
                        setImagePreview(teacherData.profile.profile_image_url);
                        setShowLayer(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                showErrorNotification("خطا در دریافت اطلاعات معلم");
            } finally {
                if (isMounted) {
                    setPageLoading(false);
                }
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, [isEditMode, teacherId]);


    // --- Helper Functions ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size / 1024 > 500) {
                showErrorNotification("حجم تصویر نباید بیشتر از ۵۰۰ کیلوبایت باشد.");
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

    const handleDisabledFieldClick = () => {
        showErrorNotification("این اطلاعات از قبل در پروفایل کاربر وجود دارد و قابل تغییر نیست.");
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
                     <BackButton />
                    <div className={style.container}>
                       

                        <div className={style.inputs_container}>
                            <form onSubmit={handleSubmit} className={style.form_style} noValidate>
                                <div className={style.inputs}>
                                    <div className={style.inputcont} style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
                                        
                                        <input
                                            className={style.txt_inp}
                                            id={nationalCodeField.name}
                                            name={nationalCodeField.name}
                                            type={'tel'}
                                            value={toPersianDigits(formData[nationalCodeField.name])}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            maxLength="10"
                                            placeholder="ابتدا کد ملی ۱۰ رقمی را وارد کنید"
                                            disabled={isCheckingNationalCode || isEditMode}
                                        />
                                        {isCheckingNationalCode && <div className={style.loading_text}><LoadingSpinner /></div>}
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
                                
                                {fields.map((field) => {
                                    const isPrefilled = prefilledFields.includes(field.name);
                                    return (
                                        <React.Fragment key={field.name}>
                                            <div className={`${style.inputs} ${isLocked ? style.section_locked : ''} ${isPrefilled ? style.prefilled : ''}`}>
                                                <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'end', alignItems: 'center', width: '100%' }} className={style.inputcont}>
                                                    <input
                                                        className={style.txt_inp}
                                                        id={field.name}
                                                        name={field.name}
                                                        type={numericFields.includes(field.name) ? 'tel' : (field.type || 'text')}
                                                        value={numericFields.includes(field.name) ? toPersianDigits(formData[field.name]) : formData[field.name]}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled={isLocked || isPrefilled}
                                                        onClick={isPrefilled ? handleDisabledFieldClick : undefined}
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
                                    );
                                })}

                                {(() => {
                                    const isGenderPrefilled = prefilledFields.includes('gender');
                                    return (
                                        <div className={`${style.dropdown_container} ${isLocked ? style.section_locked : ''} ${isGenderPrefilled ? style.prefilled : ''}`}>
                                            <div className={style.dropdown_expect_txt} onClick={!isLocked && !isGenderPrefilled ? () => setGenderDropdownVisible(prev => !prev) : handleDisabledFieldClick}>
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
                                    );
                                })()}
                                
                                {(() => {
                                    const isBirthDatePrefilled = prefilledFields.includes('birthDate');
                                    return (
                                        <div className={`${style.birthDateWrapper} ${isLocked ? style.section_locked : ''} ${isBirthDatePrefilled ? style.prefilled : ''}`}>
                                            <label className={style.label}> <span style={{ color: 'red' }}>* </span>تاریخ تولد:</label>
                                            <div className={style.dropdown_expect_txt}>
                                                <div className={style.inputWithIcon}>
                                                    <input type="text" readOnly value={toPersianDigits(formData.birthDate)} placeholder="انتخاب کنید" className={style.date_inp} onClick={!isLocked && !isBirthDatePrefilled ? () => setIsBirthDatePickerOpen(true) : handleDisabledFieldClick} />
                                                    {touched.birthDate && errors.birthDate && <div className={style.error}>{errors.birthDate}</div>}
                                                </div>
                                                <div className={style.calendarPopup}>
                                                    <img className={style.calendarPopupicon} src={calenderIcon} onClick={!isLocked && !isBirthDatePrefilled ? () => setIsBirthDatePickerOpen(prev => !prev) : handleDisabledFieldClick} alt='calendar-icon' />
                                                    {isBirthDatePickerOpen && <ShamsiDatePicker isOpen={isBirthDatePickerOpen} onClose={() => setIsBirthDatePickerOpen(false)} onSelectDate={(date) => handleDateSelect(date, 'birthDate')} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                
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
                                
                                {isEditMode && fields2.map((field) => (
                                    <React.Fragment key={field.name}>
                                        <div className={`${style.inputs} ${isLocked ? style.section_locked : ''}`}>
                                            <div className={style.inputcont} style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
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
                                    </React.Fragment>
                                ))}
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
                                {isSubmitting ? <LoadingSpinner /> : (isEditMode ? 'ثبت تغییرات' : 'تایید و ثبت نام معلم')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}