import React, { useEffect, useRef, useState } from 'react';
import style from './AddStudent.module.css';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { showSuccessNotification, showErrorNotification } from "../../services/notificationService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate, useParams } from 'react-router-dom';
import ShamsiDatePicker from '../../components/Calendar/ShamsiDatePicker';
import calenderIcon from "../../assets/icons/Calender.svg";
import api, { endpoints } from "../../config/api";
import drop_blue from '../../assets/icons/Drop-blue.svg';
import image_preview from '../../assets/icons/image-preview.svg';
import back from '../../assets/icons/back.svg';

// کامپوننت کمکی برای رندر کردن فیلدهای ورودی جهت جلوگیری از تکرار کد
const InputField = ({ name, label, required, value, onChange, error, disabled, type = 'text', placeholder = '' }) => (
    <div className={`${style.inputs} ${disabled ? style.section_locked : ''}`} key={name}>
        <div className={style.inp_lbl_container}>
            <input
                className={style.txt_inp}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
            />
            <label htmlFor={name} className={style.txt_lbl}>
                {required && <span className={style.required}>*</span>} {label}:
            </label>
        </div>
        {error && <div className={style.error}>{error}</div>}
    </div>
);

// کامپوننت مودال دو مرحله‌ای
const Modal = ({
    isOpen, onClose, Data, step,
    onSendOtp, onVerifyOtp, isSendingOtp, isVerifyingOtp,
    otpValue, onOtpChange, otpError
}) => {
    if (!isOpen) return null;

    const maskPhoneNumber = (phone) => {
        if (!phone || phone.length < 11) return 'شماره نامعتبر';
        return `${phone.substring(0, 4)}***${phone.substring(7)}`;
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
                        <h1>کد ملی ای که وارد کرده اید، در سامانه موجود است</h1>
                        <p className={style.modalinfo}>اطلاعات زیر متعلق به این کد ملی است. برای ادامه، شماره تماس را تایید کنید.</p>
                        <div className={style.modalContent}>
                            <p><strong>نام:</strong> {Data?.first_name}</p>
                            <p><strong>نام خانوادگی:</strong> {Data?.last_name}</p>
                            <p><strong>شماره تماس:</strong> {maskPhoneNumber(Data?.phone_number)}</p>
                            <button className={style.accept} onClick={onSendOtp} disabled={isSendingOtp}>
                                {isSendingOtp ? 'در حال ارسال کد...' : 'ارسال کد تایید'}
                            </button>
                        </div>
                    </>
                )}

                {step === 'otpVerification' && (
                    <>
                        <h1>شماره تماس خود را تایید کنید!</h1>
                        <p className={style.modalinfo}>کد ۶ رقمی ارسال شده به {maskPhoneNumber(Data?.phone_number)} را وارد کنید!</p>
                        <div className={style.otpContainer}>
                            <input
                                type="tel"
                                className={style.otpInput}
                                value={otpValue}
                                onChange={onOtpChange}
                                maxLength="6"
                                placeholder="------"
                            />
                            {otpError && <div className={style.error}>{otpError}</div>}
                        </div>
                        <div className={style.modalActions}>
                            <button className={style.resendButton}>ارسال مجدد</button>
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

export default function AddStudent() {
    const navigate = useNavigate();
    const { studentId: studentIdFromParams } = useParams();

    const academicDropdownsRef = useRef(null); // این خط رو اضافه کن

    // States for two-step modal
    const [modalStep, setModalStep] = useState('initialInfo');
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // States for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [existingStudentData, setExistingStudentData] = useState(null);

    // General States
    const [isSectionLocked, setIsSectionLocked] = useState(true);
    const [isCheckingNationalId, setIsCheckingNationalId] = useState(false);
    const [nationalIdError, setNationalIdError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(!!studentIdFromParams);
    const [studentId, setStudentId] = useState(studentIdFromParams || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // ADDED: State to store initial student data for diffing in edit mode
    const [initialStudentData, setInitialStudentData] = useState(null);

    // States for parents section
    const [isFatherSectionLocked, setIsFatherSectionLocked] = useState(true);
    const [isMotherSectionLocked, setIsMotherSectionLocked] = useState(true);
    const [isCheckingFatherId, setIsCheckingFatherId] = useState(false);
    const [isCheckingMotherId, setIsCheckingMotherId] = useState(false);
    const [fatherIdError, setFatherIdError] = useState(null);
    const [motherIdError, setMotherIdError] = useState(null);
    const [parentchecked, setparentchecked] = useState(false);

    // States for location section
    const [isLocationSectionLocked, setIsLocationSectionLocked] = useState(true);
    const [isCheckingPostalCode, setIsCheckingPostalCode] = useState(false);
    const [postalCodeError, setPostalCodeError] = useState(null);

    // Location & Academic & Misc states

    const [majors, setMajors] = useState([]);
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [showLayer, setShowLayer] = useState(false);
    const [genderVisible, setGenderVisible] = useState(false);
    const [selectedGender, setSelectedGender] = useState("آقا");
    const [address, setAddress] = useState('');
    const [addresss, setAddresss] = useState('');
    const [openDropdown, setOpenDropdown] = useState({});
    const [openAcademicDropdown, setOpenAcademicDropdown] = useState({});
    const calendarWrapperRef = useRef();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const [formData, setFormData] = useState({
        studentNationalId: '', firstName: '', lastName: '', fatherName: '', motherName: '',
        studentPhone: '', fatherPhone: '', motherPhone: '', fatherNationalId: '',
        motherNationalId: '', studentBirthCertificate: '', motherJob: '', motherEducation: '',
        fatherEducation: '', fatherJob: '', birthDate: '', placeOfIssue: '', birthOfPlace: '', postalCode: '', studentCode: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditMode && name === 'studentNationalId') {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        // ویرایش شده: پاک کردن خطا هنگام تایپ کردن در فیلد
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = (values) => {
        const errors = {};
        if (!values.firstName) errors.firstName = 'ضروری';
        if (!values.lastName) errors.lastName = 'ضروری';
        if (!values.studentNationalId) {
            errors.studentNationalId = 'ضروری';
        } else if (values.studentNationalId.length !== 10) {
            errors.studentNationalId = 'کد ملی باید ۱۰ رقم باشد';
        }
        if (!values.birthDate) errors.birthDate = 'ضروری';
        
  

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        // ویرایش شده: پاک کردن خطاهای قبلی قبل از ارسال
        setFormErrors({});
        const validationErrors = validate(formData);
        setFormErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setSubmitError("لطفاً فیلدهای ضروری را پر کنید.");
            return;
        }
        setIsSubmitting(true);

        try {
            if (isEditMode) {
                // --- Start of Enhanced Edit Mode Logic ---
                const updatePromises = [];

                // بخش ۱: بررسی تغییرات در اطلاعات اصلی دانش آموز
                const diffPayload = {};
                if (formData.firstName !== initialStudentData.profile.first_name) diffPayload.first_name = formData.firstName;
                if (formData.lastName !== initialStudentData.profile.last_name) diffPayload.last_name = formData.lastName;
                if (formData.studentPhone !== initialStudentData.profile.phone_number) diffPayload.phone_number = formData.studentPhone;
                if (formData.birthDate !== initialStudentData.profile.birth_date) diffPayload.birth_date = formData.birthDate;
                const currentGender = selectedGender === 'خانم' ? 'female' : 'male';
                if (currentGender !== initialStudentData.profile.gender) diffPayload.gender = currentGender;
                if (formData.studentCode !== initialStudentData.student_code) diffPayload.student_code = formData.studentCode;
                if (formData.fatherName !== initialStudentData.father_name) diffPayload.father_name = formData.fatherName;
                if (formData.studentBirthCertificate !== initialStudentData.serial_number) diffPayload.serial_number = formData.studentBirthCertificate;
                if (selectedClass?.id !== initialStudentData.active_enrollment?.class?.id) {
                    if (!selectedClass?.id) {
                        setSubmitError("لطفاً کلاس دانش‌آموز را انتخاب کنید.");
                        setIsSubmitting(false);
                        return;
                    }
                    diffPayload.class_id = selectedClass.id;
                }
                if (Object.keys(diffPayload).length > 0) {
                    updatePromises.push(api.put(endpoints.updatestudents(studentId), diffPayload));
                }

                // بخش ۲: بررسی تغییرات در آدرس دانش آموز (ویرایش یا افزودن)
                const initialAddress = initialStudentData?.profile?.addresses?.[0];
                const profileId = initialStudentData?.profile?.id;
                if (initialAddress) {
                    const addressPayload = {};
                    const addressId = initialAddress.id;
                    if (formData.postalCode !== initialAddress.postal_code) addressPayload.postal_code = formData.postalCode;
                    if (address !== initialAddress.address_line_1) addressPayload.address_line_1 = address;
                    if (addresss !== initialAddress.address_line_2) addressPayload.address_line_2 = addresss;
                    if (Object.keys(addressPayload).length > 0) {
                        updatePromises.push(api.put(endpoints.editaddress(addressId), addressPayload));
                    }
                } else if (profileId && (formData.postalCode || address || addresss)) {
                    const newAddressPayload = {
                        postal_code: formData.postalCode,
                        address_line_1: address,
                        address_line_2: addresss,
                    };
                    updatePromises.push(api.post(endpoints.addaddress(profileId), newAddressPayload));
                }

                // بخش ۳: بررسی برای افزودن والدین جدید
                const newGuardians = [];
                const initialFather = initialStudentData.parents?.find(p => p.relationship_type === 'father');
                const initialMother = initialStudentData.parents?.find(p => p.relationship_type === 'mother');

                // --- START: ADDED LOGIC FOR FATHER ---
                // بررسی افزودن پدر در صورت عدم وجود
                if (!initialFather && (formData.fatherNationalId || formData.fatherName)) {
                    let fatherPayload = {
                        national_code: formData.fatherNationalId,
                        relationship_type: "father",
                        first_name: formData.fatherName,
                        last_name: formData.lastName,
                        phone_number: formData.fatherPhone,
                        education: formData.fatherEducation,
                        occupation: formData.fatherJob,
                        gender: 'male',
                    };

                    // اگر کد ملی وارد شده، آن را چک کن تا اطلاعات موجود بازخوانی شود
                    if (formData.fatherNationalId && formData.fatherNationalId.length === 10) {
                        try {

                            const response = await api.get(`${endpoints.getinfos(formData.fatherNationalId)}&entity_type=student`);
                            const { status, data } = response.data;
                            if (status && data.entity_exists) {
                                // اطلاعات موجود در سرور را جایگزین اطلاعات وارد شده توسط کاربر کن
                                fatherPayload.first_name = data.profile_data.first_name || fatherPayload.first_name;
                                fatherPayload.phone_number = data.profile_data.phone_number || fatherPayload.phone_number;
                            }
                        } catch (err) {
                            console.error("Failed to check father's national ID during submission:", err);
                        }
                    }
                    newGuardians.push(fatherPayload);
                }
                // --- END: ADDED LOGIC FOR FATHER ---

                // --- START: ADDED LOGIC FOR MOTHER ---
                // بررسی افزودن مادر در صورت عدم وجود
                if (!initialMother && (formData.motherNationalId || formData.motherName)) {
                    let motherPayload = {
                        national_code: formData.motherNationalId,
                        relationship_type: "mother",
                        first_name: formData.motherName,
                        last_name: formData.lastName,
                        phone_number: formData.motherPhone,
                        education: formData.motherEducation,
                        occupation: formData.motherJob,
                        gender: 'female',
                    };

                    // اگر کد ملی وارد شده، آن را چک کن تا اطلاعات موجود بازخوانی شود
                    if (formData.motherNationalId && formData.motherNationalId.length === 10) {
                        try {
                            const response = await api.get(`${endpoints.getinfos(formData.fatherNationalId)}&entity_type=student`);
                            const { status, data } = response.data;
                            if (status && data.entity_exists) {
                                motherPayload.first_name = data.profile_data.first_name || motherPayload.first_name;
                                motherPayload.phone_number = data.profile_data.phone_number || motherPayload.phone_number;
                            }
                        } catch (err) {
                            console.error("Failed to check mother's national ID during submission:", err);
                        }
                    }
                    newGuardians.push(motherPayload);
                }
                // --- END: ADDED LOGIC FOR MOTHER ---

                if (newGuardians.length > 0) {
                    updatePromises.push(api.post(endpoints.addguardians(studentId), { guardians: newGuardians }));
                }

                // بخش ۴: اجرای تمام درخواست‌های لازم
                if (updatePromises.length === 0) {
                    showSuccessNotification("هیچ تغییری برای ذخیره وجود ندارد.");
                    setIsSubmitting(false);
                    return;
                }

                await Promise.all(updatePromises);
                showSuccessNotification("اطلاعات دانش آموز با موفقیت ویرایش شد.");
                // --- End of Enhanced Edit Mode Logic ---

            } else {
                // --- Start of Add Mode Logic (ویرایش شده برای شماره تلفن) ---
                if (!selectedClass?.id) {
                    setSubmitError("لطفاً کلاس دانش‌آموز را انتخاب کنید.");
                    setIsSubmitting(false);
                    return;
                }
                
                // **ایجاد آبجکت آدرس دانش آموز (فقط در صورت وجود کد پستی)**
                const studentAddressPayload = {};
                if (formData.postalCode) {
                    studentAddressPayload.postal_code = formData.postalCode;
                    studentAddressPayload.address_line_1 = address;
                    studentAddressPayload.address_line_2 = addresss;
                }
                
                // **ایجاد آرایه guardians (فقط در صورت پر بودن کد ملی و افزودن آدرس فقط در صورت وجود کد پستی)**
                const guardiansPayload = [];
                const guardianAddress = formData.postalCode ? {
                    postal_code: formData.postalCode,
                    address_line_1: address,
                    address_line_2: addresss
                } : undefined;

                if (formData.fatherNationalId) {
                    const father = {
                        national_code: formData.fatherNationalId,
                        relationship_type: "father",
                        first_name: formData.fatherName,
                        last_name: formData.lastName,
                        phone_number: formData.fatherPhone,
                        education: formData.fatherEducation,
                        occupation: formData.fatherJob,
                        gender: 'male',
                    };
                    if (guardianAddress) {
                        father.address = guardianAddress;
                    }
                    guardiansPayload.push(father);
                }

                if (formData.motherNationalId) {
                    const mother = {
                        national_code: formData.motherNationalId,
                        relationship_type: "mother",
                        first_name: formData.motherName,
                        last_name: formData.lastName,
                        education: formData.motherEducation,
                        occupation: formData.motherJob,
                        phone_number: formData.motherPhone,
                        gender: 'female',
                    };
                    if (guardianAddress) {
                        mother.address = guardianAddress;
                    }
                    guardiansPayload.push(mother);
                }
                
                const basePayload = {
                    username: formData.username,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    student_code: formData.studentCode,
                    national_code: formData.studentNationalId,
                    gender: selectedGender === 'خانم' ? 'female' : 'male',
                    birth_date: formData.birthDate,
                    class_id: selectedClass.id,
                };

                // **تغییر جدید: اضافه کردن phone_number فقط در صورت وجود مقدار**
                if (formData.studentPhone) {
                    basePayload.phone_number = formData.studentPhone;
                }
                
                // **اضافه کردن serial_number فقط در صورت وجود مقدار (منطق قبلی)**
                if (formData.studentBirthCertificate) {
                    basePayload.serial_number = formData.studentBirthCertificate;
                }

                // **اضافه کردن father_name فقط در صورت وجود مقدار (منطق قبلی)**
                if (formData.fatherName) {
                    basePayload.father_name = formData.fatherName;
                }

                // **اضافه کردن student_address فقط در صورت پر بودن کد پستی (منطق قبلی)**
                if (Object.keys(studentAddressPayload).length > 0) {
                    basePayload.student_address = studentAddressPayload;
                }

                // **اضافه کردن guardiansPayload فقط در صورت وجود والد (منطق قبلی)**
                if (guardiansPayload.length > 0) {
                    basePayload.guardians = guardiansPayload;
                }

                await api.post(endpoints.addstudents(), basePayload);
                showSuccessNotification("دانش آموز با موفقیت اضافه شد.");
                
                // --- End of Add Mode Logic ---
            }
            navigate(-1);
        } catch (err) {
            console.error("Submission Error Response:", err.response);
            const errorData = err.response?.data;
            let errorMessage = "خطایی در ارتباط با سرور رخ داد.";

            if (errorData?.message) {
                errorMessage = errorData.message;
            }

            // --- START: ویرایش شده - منطق جدید برای پردازش و نمایش خطاها ---
            if (errorData?.errors) {
                const newFormErrors = {};

                // نقشه برای تبدیل نام فیلدهای سرور به نام فیلدهای فرم در React
                const fieldMap = {
                    'phone_number': 'studentPhone',
                    'serial_number': 'studentBirthCertificate',
                    'national_code': 'studentNationalId',
                    'first_name': 'firstName',
                    'last_name': 'lastName',
                    'student_code': 'studentCode',
                    'father_name': 'fatherName',
                    'guardians.0.phone_number': 'fatherPhone', // خطای شماره تماس پدر
                    'guardians.0.national_code': 'fatherNationalId',
                    'guardians.1.phone_number': 'motherPhone', // خطای شماره تماس مادر
                    'guardians.1.national_code': 'motherNationalId',
                };

                for (const serverField in errorData.errors) {
                    const clientField = fieldMap[serverField]; // پیدا کردن نام متناظر در فرم
                    if (clientField && errorData.errors[serverField]?.length > 0) {
                        // گرفتن اولین پیام خطا و قرار دادن آن در استیت
                        newFormErrors[clientField] = errorData.errors[serverField][0];
                    }
                }

                // به‌روزرسانی استیت خطاها
                setFormErrors(prev => ({ ...prev, ...newFormErrors }));
                errorMessage = "اطلاعات ارسال شده معتبر نیست. لطفاً خطاها را بررسی کنید.";
            }
            // --- END: ویرایش شده ---

            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    //  --- START: MODIFIED FUNCTION ---
    // --- START: MODIFIED FUNCTION ---
    const populateFormWithData = (data, allData) => {
        // اگر دیتا یا پروفایل دانش آموز وجود نداشت، تابع را متوقف کن
        if (!data || !data.profile) return;
        const profileData = data.profile;

        // 1. استخراج اطلاعات والدین از آرایه parents
        const fatherInfo = data.parents?.find(p => p.relationship_type === 'father');
        const motherInfo = data.parents?.find(p => p.relationship_type === 'mother');

        // 2. استخراج اطلاعات آدرس از پروفایل دانش آموز
        const studentAddress = profileData.addresses?.[0];
        if (studentAddress) {
            setAddress(studentAddress.address_line_1 || '');
            setAddresss(studentAddress.address_line_2 || '');
        }

        // 3. استخراج عکس پروفایل در صورت وجود
        if (profileData.image) {
            setImagePreview(profileData.image);
            setShowLayer(true);
        }

        // 4. پر کردن استیت فرم با اطلاعات استخراج شده
        setFormData(prev => ({
            ...prev,
            // اطلاعات اصلی دانش آموز
            studentCode: data.student_code || '',
            studentBirthCertificate: data.serial_number || '',
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            studentPhone: profileData.phone_number || '',
            studentNationalId: profileData.national_code || '',
            birthDate: profileData.birth_date || '',

            // اطلاعات آدرس
            postalCode: studentAddress?.postal_code || '',

            // اطلاعات پدر (اولویت با اطلاعات پروفایل پدر است)
            fatherName: fatherInfo?.profile?.first_name || data.father_name || '',
            fatherNationalId: fatherInfo?.profile?.national_code || '',
            fatherPhone: fatherInfo?.profile?.phone_number || '',
            fatherJob: fatherInfo?.occupation || '',
            fatherEducation: fatherInfo?.education || '',

            // اطلاعات مادر
            motherName: motherInfo?.profile?.first_name || '',
            motherNationalId: motherInfo?.profile?.national_code || '',
            motherPhone: motherInfo?.profile?.phone_number || '',
            motherJob: motherInfo?.occupation || '',
            motherEducation: motherInfo?.education || '',
        }));

        // 5. تنظیم جنسیت
        setSelectedGender(profileData.gender === 'female' ? 'خانم' : 'آقا');

        // 6. تنظیم مقادیر دراپ‌دان‌های تحصیلی
        if (data.active_enrollment?.class) {
            const enrolledClass = data.active_enrollment.class;

            // پیدا کردن و تنظیم کلاس
            const studentClass = allData.classes?.find(c => c.id === enrolledClass.id);
            if (studentClass) setSelectedClass(studentClass);

            // پیدا کردن و تنظیم پایه تحصیلی
            const studentGrade = allData.grades?.find(g => g.id === enrolledClass.grade_level?.id);
            if (studentGrade) setSelectedGrade(studentGrade);

            // پیدا کردن و تنظیم رشته تحصیلی
            const studentMajor = allData.majors?.find(m => m.id === enrolledClass.field_of_study?.id);
            if (studentMajor) setSelectedMajor(studentMajor);
        }
    };
    // --- END: MODIFIED FUNCTION ---


    const populateFatherData = (profileData) => {
        if (!profileData) return;
        setFormData(prev => ({ ...prev, fatherName: profileData.first_name || '', fatherPhone: profileData.phone_number || '' }));
    };

    const populateMotherData = (profileData) => {
        if (!profileData) return;
        setFormData(prev => ({ ...prev, motherName: profileData.first_name || '', motherPhone: profileData.phone_number || '' }));
    };

    const resetStudentSection = () => {
        setIsSectionLocked(true);
        setIsEditMode(false);
        setStudentId(null);
        setNationalIdError(null);
        setFormData(prev => ({
            ...prev,
            firstName: '', lastName: '', studentPhone: '', studentCode: '',
            studentBirthCertificate: '', placeOfIssue: '', birthOfPlace: '', birthDate: '',
        }));
    };

    const handleNationalIdCheck = async () => {
        if (isCheckingNationalId || isEditMode) return;
        setIsCheckingNationalId(true);
        setNationalIdError(null);
        try {
            const response = await api.get(`${endpoints.getinfos(formData.studentNationalId)}&entity_type=student`);
            const { status, data } = response.data;
            if (status && data.entity_exists) {
                const profileData = data.profile_data;
                setModalStep('initialInfo');
                setExistingStudentData(profileData);
                setIsModalOpen(true);
            } else {
                setIsEditMode(false);
                setStudentId(null);
                setIsSectionLocked(false);
            }
        } catch (error) {
            setNationalIdError("خطایی در استعلام کد ملی رخ داد.");
        } finally {
            setIsCheckingNationalId(false);
        }
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        setOtpError(null);
        try {

            await new Promise(resolve => setTimeout(resolve, 1000));
            setModalStep('otpVerification');
        } catch (err) {
            showErrorNotification("خطا در ارسال کد. لطفا دوباره تلاش کنید.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpCode.length !== 6) {
            setOtpError("کد تایید باید ۶ رقم باشد.");
            return;
        }
        setIsVerifyingOtp(true);
        setOtpError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (existingStudentData) {
                setIsEditMode(true);
                setStudentId(existingStudentData.profile_id);
                populateFormWithData(existingStudentData, { classes, grades, majors });
                setIsSectionLocked(false);
            }
            setIsModalOpen(false);
            setModalStep('initialInfo');
            setOtpCode('');
        } catch (err) {
            setOtpError("کد وارد شده صحیح نمی باشد.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setExistingStudentData(null);
        setModalStep('initialInfo');
        setOtpCode('');
        setOtpError(null);
        resetStudentSection();
    };

    const handleFatherNationalIdCheck = async () => {
        if (isCheckingFatherId) return;
        setIsCheckingFatherId(true);
        setFatherIdError(null);
        try {
            const response = await api.get(`${endpoints.getinfos(formData.fatherNationalId)}&entity_type=student`);
            const { status, data } = response.data;
            if (status && data.entity_exists) populateFatherData(data.profile_data);
        } catch (error) {
            setFatherIdError("خطایی در استعلام کد ملی پدر رخ داد.");
        } finally {
            setIsFatherSectionLocked(false);
            setIsCheckingFatherId(false);
        }
    };

    const handleMotherNationalIdCheck = async () => {
        if (isCheckingMotherId) return;
        setIsCheckingMotherId(true);
        setMotherIdError(null);
        try {
            const response = await api.get(`${endpoints.getinfos(formData.motherNationalId)}&entity_type=student`);
            const { status, data } = response.data;
            if (status && data.entity_exists) populateMotherData(data.profile_data);
        } catch (error) {
            setMotherIdError("خطایی در استعلام کد ملی مادر رخ داد.");
        } finally {
            setIsMotherSectionLocked(false);
            setIsCheckingMotherId(false);
        }
    };

    const handlePostalCodeCheck = async () => {
        if (isCheckingPostalCode) return;
        setIsCheckingPostalCode(true);
        setPostalCodeError(null);
        try {
            const response = await api.get(endpoints.postcode(formData.postalCode));
            const locationData = response.data.data;
            if (locationData) {
                if (locationData.address_line) setAddress(locationData.address_line);
            }
        } catch (error) {
            setPostalCodeError("کد پستی نامعتبر است یا خطایی در استعلام رخ داد.");
        } finally {
            setIsLocationSectionLocked(false);
            setIsCheckingPostalCode(false);
        }
    };

    useEffect(() => {
        if (!isEditMode && formData.studentNationalId?.length === 10) {
            handleNationalIdCheck();
        } else if (!isEditMode && !isSectionLocked) {
            resetStudentSection();
        }
    }, [formData.studentNationalId, isEditMode]);

    useEffect(() => {
        if (formData.fatherNationalId?.length === 10 && isFatherSectionLocked) handleFatherNationalIdCheck();
    }, [formData.fatherNationalId, isFatherSectionLocked]);

    useEffect(() => {
        if (formData.motherNationalId?.length === 10 && isMotherSectionLocked) handleMotherNationalIdCheck();
    }, [formData.motherNationalId, isMotherSectionLocked]);

    useEffect(() => {
        if (formData.postalCode?.length === 10 && isLocationSectionLocked) handlePostalCodeCheck();
    }, [formData.postalCode, isLocationSectionLocked]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoadingData(true);
            try {
                const [majorsRes, gradesRes, classesRes] = await Promise.all([

                    api.get(endpoints.getmajor()),
                    api.get(endpoints.getgrade()),
                    api.get(endpoints.classes())
                ]);

                const allData = {

                    majors: majorsRes.data.data || [],
                    grades: gradesRes.data.data || [],
                    classes: classesRes.data.data || [],
                };


                setMajors(allData.majors);
                setGrades(allData.grades);
                setClasses(allData.classes);

                if (studentIdFromParams) {
                    setIsEditMode(true);
                    setStudentId(studentIdFromParams);
                    setIsSectionLocked(false);
                    setIsFatherSectionLocked(false);
                    setIsMotherSectionLocked(false);
                    setIsLocationSectionLocked(false);

                    const studentResponse = await api.get(endpoints.student(studentIdFromParams));
                    const studentData = studentResponse.data.data;

                    // ADDED: Store initial data for diffing
                    setInitialStudentData(studentData);

                    populateFormWithData(studentData, allData);
                } else {
                    setIsSectionLocked(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                showErrorNotification("خطا در دریافت اطلاعات!");
                if (isEditMode) navigate(-1);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAllData();
    }, [studentIdFromParams, navigate]);


    useEffect(() => {
        // تابعی که با هر کلیک در صفحه اجرا میشه
        function handleClickOutside(event) {
            // اگر ref به عنصری متصل بود و کلیک خارج از اون عنصر بود
            if (academicDropdownsRef.current && !academicDropdownsRef.current.contains(event.target)) {
                setOpenAcademicDropdown({}); // منوی دراپ‌دان‌های تحصیلی رو ببند
            }
        }

        // شنونده رو به صفحه اضافه کن
        document.addEventListener("mousedown", handleClickOutside);

        // در زمان پاکسازی (cleanup)، شنونده رو حذف کن تا حافظه اشغال نشه
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // آرایه خالی یعنی این افکت فقط یک بار بعد از رندر اولیه اجرا میشه



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size / 1024 > 500) { alert("حجم تصویر نباید بیشتر از ۵۰۰ کیلوبایت باشد."); return; }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); setShowLayer(true); };
            reader.readAsDataURL(file);
        }
    };

    const handleDateSelect = (date) => {
        const formattedDate = date.format('YYYY/MM/DD');
        setFormData(prev => ({ ...prev, birthDate: formattedDate }));
    };

    const toggleDropdown = (key, type = 'location') => {
        const setDropdownState = type === 'academic' ? setOpenAcademicDropdown : setOpenDropdown;

        setDropdownState(prev => {
            // چک می‌کنیم آیا دراپ‌دان فعلی از قبل باز بوده یا نه
            const isAlreadyOpen = !!prev[key];

            // اگر باز بوده، با کلیک مجدد باید بسته بشه (یک آبجکت خالی برمیگردونیم تا همه بسته بشن)
            // اگر بسته بوده، باید باز بشه و بقیه بسته بشن (فقط کلید فعلی رو true میکنیم)
            return isAlreadyOpen ? {} : { [key]: true };
        });
    };

    const handleSelect = (handler, option, dropdownKey, type = 'location') => {
        handler(option);
        toggleDropdown(dropdownKey, type);
    };

    const handlecheckbox = () => {
        setparentchecked(!parentchecked);
    };



    const academicDropdowns = [
        { key: 'major', label: 'رشته', value: selectedMajor, options: majors, handler: setSelectedMajor },
        { key: 'grade', label: 'پایه', value: selectedGrade, options: grades, handler: setSelectedGrade },
        { key: 'class', label: 'کلاس', value: selectedClass, options: classes, handler: setSelectedClass },
    ];

    if (isLoadingData) {
        return (
            <div className='Dashboard'>
                <Header />
                <div className='App-Container'>
                    <Sidebar />
                    <div className='Main-Content' >
                        <div className={style.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className={style.Loading}><LoadingSpinner /><p>در حال بارگذاری اطلاعات...</p></div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='Dashboard'>
            <Header />
            <div className='App-Container'>
                <Sidebar />
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    Data={existingStudentData}
                    step={modalStep}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                    isSendingOtp={isSendingOtp}
                    isVerifyingOtp={isVerifyingOtp}
                    otpValue={otpCode}
                    onOtpChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    otpError={otpError}
                />
                <div className='Main-Content' id='main'>
                    <form onSubmit={handleSubmit} className={style.container_wrapper}>
                        <div className={style.container}>
                            <div className={style.both_container}>
                                <div className={style.scroll_both}>
                                    <div className={style.right_inputs}>
                                        <div className={style.sec_header}><div className={style.left_line} /><p className={style.sec_name}>مشخصات فردی</p><div className={style.right_line} /></div>
                                        <div className={style.inputs}>
                                            <div className={style.inp_lbl_container}>
                                                {isCheckingNationalId && <span className={style.loading_text}><LoadingSpinner /></span>}
                                                <input className={style.txt_inp} name="studentNationalId" value={formData.studentNationalId} onChange={handleChange} maxLength="10" disabled={isEditMode} />
                                                <label htmlFor='studentNationalId' className={style.txt_lbl}><span className={style.required}>*</span> کد ملی دانش آموز:</label>
                                                {nationalIdError && <div className={style.error}>{nationalIdError}</div>}
                                                {formErrors.studentNationalId && <div className={style.error}>{formErrors.studentNationalId}</div>}</div>
                                        </div>
                                        <InputField name="firstName" label="نام" required value={formData.firstName} onChange={handleChange} error={formErrors.firstName} disabled={isSectionLocked} />
                                        <InputField name="lastName" label="نام خانوادگی" required value={formData.lastName} onChange={handleChange} error={formErrors.lastName} disabled={isSectionLocked} />
                                        <InputField name="studentCode" label="کد دانش آموز" required value={formData.studentCode} onChange={handleChange} error={formErrors.studentCode} disabled={isSectionLocked} />
                                        <div className={style.dropdown_container}>
                                            <div className={`${style.dropdown_exept_txt} ${isSectionLocked ? style.section_locked : ''}`} onClick={() => !isSectionLocked && setGenderVisible(!genderVisible)}>
                                                <div className={style.displayBox}>{selectedGender}</div>
                                                <div className={style.arrowBox}><svg className={`${style.arrow} ${genderVisible ? style.rotate : ''}`} viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="#69b0b2" /></svg></div>
                                            </div>
                                            <div className={`${style.dropdown_txt} ${isSectionLocked ? style.section_locked : ''}`}><p className={style.label}>:جنسیت</p></div>
                                            <div className={`${style.dropdownMenu} ${genderVisible ? style.show : ''}`}>
                                                <div className={style.dropdownItem} onMouseDown={() => { setSelectedGender("خانم"); setGenderVisible(false); }}>خانم</div>
                                                <div className={style.dropdownItem} onMouseDown={() => { setSelectedGender("آقا"); setGenderVisible(false); }}>آقا</div>
                                            </div>
                                        </div>
                                        {/* ویرایش شده: اضافه کردن پراپ error */}
                                        <InputField name="studentBirthCertificate" label="سریال شناسنامه دانش آموز" placeholder={"28/585858"+ "ذ"} value={formData.studentBirthCertificate} onChange={handleChange} error={formErrors.studentBirthCertificate} disabled={isSectionLocked} />
                                        <InputField name="studentPhone" label="شماره تماس دانش آموز" required value={formData.studentPhone} onChange={handleChange} error={formErrors.studentPhone} disabled={isSectionLocked} />
                                        <InputField name="placeOfIssue" label="محل صدور" value={formData.placeOfIssue} onChange={handleChange} disabled={isSectionLocked} />
                                        <InputField name="birthOfPlace" label="محل تولد" value={formData.birthOfPlace} onChange={handleChange} disabled={isSectionLocked} />
                                        <div className={`${style.birthDateWrapper} ${isSectionLocked ? style.section_locked : ''}`} ref={calendarWrapperRef}>
                                            {formErrors.birthDate && <div className={style.error}>{formErrors.birthDate}</div>}
                                            <label className={style.label}><span className={style.required}>*</span> تاریخ تولد:</label>
                                            <input type="text" readOnly value={formData.birthDate} placeholder="انتخاب کنید" className={style.date_inp} onClick={() => !isSectionLocked && setIsPickerOpen(p => !p)} />
                                            <ShamsiDatePicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelectDate={handleDateSelect} />
                                            <img src={calenderIcon} className={style.calendarPopup} onClick={() => !isSectionLocked && setIsPickerOpen(prev => !prev)} alt='' />
                                        </div>

                                        <div className={style.sec_header}><div className={style.left_line} /><p className={style.sec_name}>مشخصات محل سکونت</p><div className={style.right_line} /></div>

                                        <div className={style.inputs}>
                                            <div className={style.inp_lbl_container}>
                                                {isCheckingPostalCode && <span className={style.loading_text}><LoadingSpinner /></span>}
                                                <input className={style.txt_inp} name="postalCode" value={formData.postalCode} onChange={handleChange} maxLength="10" />
                                                <label htmlFor='postalCode' className={style.txt_lbl}>کد پستی:</label>
                                                {postalCodeError && <div className={style.error}>{postalCodeError}</div>}
                                            </div>
                                            {/* ویرایش شده: اضافه کردن نمایش خطا برای کد پستی */}
                                            {formErrors.postalCode && <div className={style.error}>{formErrors.postalCode}</div>}

                                        </div>
                                        <div className={`${style.address} ${isLocationSectionLocked ? style.section_locked : ''}`}>
                                            <label htmlFor="address1" className={style.txt_lbl2}><span className={style.red_star}></span>نشانی:</label>
                                            <textarea id='address1' className={style.txt_area} value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLocationSectionLocked}></textarea>
                                        </div>
                                        <div className={`${style.address} ${isLocationSectionLocked ? style.section_locked : ''}`}>
                                            <label htmlFor="address2" className={style.txt_lbl2}><span className={style.red_star}></span>جزییات دقیق:</label>
                                            <textarea id='address2' className={style.txt_area} value={addresss} onChange={(e) => setAddresss(e.target.value)} disabled={isLocationSectionLocked}></textarea>
                                        </div>
                                        <div className={`${style.address2} ${isLocationSectionLocked ? style.section_locked : ''}`}>
                                            <div onClick={handlecheckbox} className={style.checkbox}>{parentchecked && <div></div>}</div>
                                            <label className={style.no_parent}>پدر و مادر جدا یا فوت شده اند و فرزند جای دیگری است؟</label>
                                        </div>
                                    </div>
                                    <div className={style.left_inputs}>
                                        <div className={style.sec_header}><div className={style.left_line} /><p className={style.sec_name}>مشخصات تحصیلی</p><div className={style.right_line} /></div>

                                        {/* این div والد جدید است */}
                                        <div className={style.nothing} ref={academicDropdownsRef}>
                                            {academicDropdowns.map(({ key, label, value, options, handler, disabled = false }) => {
                                                const isDisabled = disabled;
                                                return (
                                                    <div className={style.dropdown_container} key={key}>
                                                        <div className={style.dropdown_exept_txt}>
                                                            <div className={`${style.displayBox} ${isDisabled ? style.disabled : ''}`} onClick={() => !isDisabled && toggleDropdown(key, 'academic')}>
                                                                <span>{(value?.name || 'انتخاب کنید')}</span>
                                                            </div>
                                                            <div className={style.arrowBox} onClick={() => !isDisabled && toggleDropdown(key, 'academic')}><img className={`${style.arrow} ${openAcademicDropdown[key] ? style.rotate : ''}`} src={drop_blue} alt="arrow" /></div>
                                                        </div>
                                                        <label className={style.txt_list}>:{label}<span className={style.red_star}>*</span></label>
                                                        {openAcademicDropdown[key] && !isDisabled && (<ul className={`${style.dropdown_list} ${openAcademicDropdown[key] ? style.show : ''}`}>{options?.length > 0 ? options.map((opt) => (<li className={style.dropdown_item} key={opt.id} onMouseDown={() => handleSelect(handler, opt, key, 'academic')}>{opt.name}</li>)) : <li className={style.dropdown_item_disabled}>موردی یافت نشد</li>}</ul>)}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className={style.sec_header}><div className={style.left_line} /><p className={style.sec_name}>مشخصات والدین</p><div className={style.right_line} /></div>
                                        <div className={style.inputs}>
                                            <div className={style.inp_lbl_container}>
                                                {isCheckingFatherId && <span className={style.loading_text}><LoadingSpinner /></span>}
                                                <input className={style.txt_inp} name="fatherNationalId" value={formData.fatherNationalId} onChange={handleChange} maxLength="10" />
                                                <label htmlFor='fatherNationalId' className={style.txt_lbl}>کد ملی پدر:</label>
                                                {fatherIdError && <div className={style.error}>{fatherIdError}</div>}
                                                {/* ویرایش شده: اضافه کردن نمایش خطا برای کد ملی پدر */}
                                                {formErrors.fatherNationalId && <div className={style.error}>{formErrors.fatherNationalId}</div>}
                                            </div>
                                        </div>
                                        <div className={style.inputs}>
                                            <div className={style.inp_lbl_container}>
                                                {isCheckingMotherId && <span className={style.loading_text}><LoadingSpinner /></span>}
                                                <input className={style.txt_inp} name="motherNationalId" value={formData.motherNationalId} onChange={handleChange} maxLength="10" />
                                                <label htmlFor='motherNationalId' className={style.txt_lbl}>کد ملی مادر:</label>
                                                {motherIdError && <div className={style.error}>{motherIdError}</div>}
                                                {/* ویرایش شده: اضافه کردن نمایش خطا برای کد ملی مادر */}
                                                {formErrors.motherNationalId && <div className={style.error}>{formErrors.motherNationalId}</div>}
                                            </div>
                                        </div>
                                        <InputField name="fatherName" label="نام پدر" required value={formData.fatherName} onChange={handleChange} error={formErrors.fatherName} disabled={isFatherSectionLocked} />
                                        <InputField name="fatherPhone" label="شماره تماس پدر" required value={formData.fatherPhone} onChange={handleChange} error={formErrors.fatherPhone} disabled={isFatherSectionLocked} />
                                        <InputField name="fatherJob" label="شغل پدر" value={formData.fatherJob} onChange={handleChange} disabled={isFatherSectionLocked} />
                                        <InputField name="fatherEducation" label="تحصیلات پدر" value={formData.fatherEducation} onChange={handleChange} disabled={isFatherSectionLocked} />
                                        <InputField name="motherName" label="نام مادر" value={formData.motherName} onChange={handleChange} disabled={isMotherSectionLocked} />
                                        <InputField name="motherPhone" label="شماره تماس مادر" value={formData.motherPhone} onChange={handleChange} disabled={isMotherSectionLocked} error={formErrors.motherPhone} />
                                        <InputField name="motherJob" label="شغل مادر" value={formData.motherJob} onChange={handleChange} disabled={isMotherSectionLocked} />
                                        <InputField name="motherEducation" label="تحصیلات مادر" value={formData.motherEducation} onChange={handleChange} disabled={isMotherSectionLocked} />
                                    </div>
                                </div>
                            </div>
                            <div className={style.image_picker}>
                                <label className={style.the_picker} dir="rtl">
                                    <div className={`${style.picker_content} ${imagePreview ? style.hide : ''}`}>
                                        <img src={image_preview} alt="pin" className={style.picker_icon} />
                                        <p className={style.picker_text}>افزودن تصویر</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                    {imagePreview && (<div className={`${style.preview_keeper} ${showLayer ? style.show : ''}`}><img src={imagePreview} alt="Preview" className={`${style.img_preview} ${showLayer ? style.show : ''}`} /></div>)}
                                </label>
                                {submitError && <div className={style.submitError}>{submitError}</div>}
                                <button type="submit" className={style.submit_btn} disabled={isSubmitting || (isSectionLocked && !isEditMode)}>
                                    {isSubmitting ? <LoadingSpinner /> : (isEditMode ? 'ذخیره تغییرات' : 'تایید و ثبت نام دانش آموز')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}