import React, { useState, useRef, useEffect, useCallback ,useLayoutEffect} from 'react';
import styles from './MatchingModal.module.css';
import api, { endpoints } from "../../config/api"; // فرض می‌شود این مسیر صحیح است
import { showErrorNotification, showWarningNotification, showSuccessNotification } from '../../services/notificationService';

// کامپوننت داخلی برای آپلود فایل اکسل
const ExcelUploader = ({ onUploadSuccess, isUploading, setIsUploading, uploadError, setUploadError }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;

        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        if (!isExcel) {
            setUploadError('لطفا فقط فایل اکسل (xlsx, xls) آپلود کنید.');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(endpoints.exelupload(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.data?.headers && Array.isArray(response.data.data.headers)) {
                onUploadSuccess(response.data.data.headers, response.data.data.temp_file_path);
            } else {

                setUploadError('پاسخ سرور معتبر نبود. سربرگ‌های فایل یافت نشد.');
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.response?.data?.data?.message || 'خطا در آپلود فایل. لطفاً دوباره تلاش کنید.';
            setUploadError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <form className={styles['upload-form']} onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input
                ref={inputRef}
                type="file"
                className={styles['upload-input']}
                accept=".xlsx, .xls"
                onChange={handleChange}
            />
            <label
                className={`${styles['drop-zone']} ${dragActive ? styles.dragActive : ""}`} htmlFor="input-file-upload" >

                {isUploading ? (
                    <>
                        <div className={styles.spinner}></div>
                        <p>در حال بارگذاری...</p>
                    </>
                ) : (
                    <>
                        <button type="button" className={styles['upload-button']} onClick={onButtonClick}>فایل را انتخاب کنید</button>
                        <p className={styles['upload-text']}></p>
                    </>
                )}

            </label>
            {dragActive && <div className={styles['drag-file-element']} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
            {uploadError && <p className={styles['upload-error']}>{uploadError}</p>}
        </form>
    );
};


const rightFieldsData = [
    { id: 'right-1', name: 'کد ملی', backendKey: 'kode_meli' },
    { id: 'right-2', name: 'نام کامل (نام و نام خانوادگی)', backendKey: 'nam_kamel' },
    { id: 'right-3', name: 'نام', backendKey: 'nam' },
    { id: 'right-4', name: 'نام خانوادگی', backendKey: 'nam_khanevadegi' },
    { id: 'right-5', name: 'نام پدر', backendKey: 'father_name' },
    { id: 'right-6', name: 'رشته', backendKey: 'reshte' },
    { id: 'right-7', name: 'پایه', backendKey: 'paye' },
    { id: 'right-8', name: 'کد پستی', backendKey: 'kode_posti' },

    { id: 'right-10', name: 'شماره تماس', backendKey: 'phone_number' },
    { id: 'right-11', name: 'تاریخ تولد', backendKey: 'tarikh_tavalod' },
    { id: 'right-12', name: 'نام کلاس', backendKey: 'class_name' },
    { id: 'right-13', name: 'حرف سریال شناسنامه', backendKey: 'harf_serial' },
    { id: 'right-14', name: 'عدد سریال شناسنامه', backendKey: 'adad_serial' },
    { id: 'right-15', name: 'شماره سریال شناسنامه', backendKey: 'shomare_serial' },
    { id: 'right-16', name: 'جنسیت', backendKey: 'jensiat' },

];

const MatchingModal = ({ isOpen, onClose, onSave, academicYearId }) => {
    const [modalStep, setModalStep] = useState('upload');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [saveError, setSaveError] = useState(null); // <-- استیت جدید برای خطاهای ثبت
    const [leftFields, setLeftFields] = useState([]);
    const [rightFields, setRightFields] = useState([]);
    const [connections, setConnections] = useState([]);
    const [connectingField, setConnectingField] = useState(null);
    const [tempFilePath, setTempFilePath] = useState(null);
    const [activeYear, setActiveYear] = useState(null);

    const svgRef = useRef(null);
    const containerRef = useRef(null);

    const handleClose = () => {
        setModalStep('upload');
        setLeftFields([]);
        setRightFields([]);
        setConnections([]);
        setConnectingField(null);
        setUploadError(null);
        setSaveError(null); // ریست کردن خطای ثبت
        setTempFilePath(null);
        setIsSaving(false);
        onClose();
    };

    useEffect(() => {
        const fetchActiveYear = async () => {
            try {
                const response = await api.get(endpoints.getactive());
                setActiveYear(response.data.data.id);

            } catch (error) {

            }
        };

        fetchActiveYear();
    }, [modalStep]);


    const handleFileUploadSuccess = (headersFromApi, filePath) => {
        const uploadedFields = headersFromApi
            .filter(colName => colName && colName.trim() !== "")
            .map((colName, index) => ({
                id: `left-${index + 1}`,
                name: colName,
            }));

        setLeftFields(uploadedFields);
        setRightFields(rightFieldsData);
        setTempFilePath(filePath);
        setModalStep('matching');
    };

    const handleSave = async () => {
        if (!tempFilePath) {
            setSaveError("مسیر فایل موقت یافت نشد!");
            return;
        }

        setIsSaving(true);
        setSaveError(null); // پاک کردن خطاهای قبلی

        const mappings = connections.reduce((acc, conn) => {
            if (conn.to.backendKey) {
                acc[conn.to.backendKey] = conn.from.name;
            }
            return acc;
        }, {});

        const finalPayload = {
            temp_file_path: tempFilePath,
            academic_year_id: activeYear,
            mappings: mappings,
        };

        try {
            await api.post(endpoints.machingexelupload(), finalPayload);
            showSuccessNotification("تطبیق سربرگ‌ها با موفقیت ثبت شد.");
            onSave();
            handleClose();
        } catch (error) {


            // *** تغییر اصلی: پردازش و نمایش خطاها ***
            const apiError = error.response?.data;
            let errorMessage = apiError?.message || "خطا در ثبت اطلاعات.";

            if (apiError?.errors) {
                const specificErrors = Object.values(apiError.errors)
                    .flat() // آرایه‌های تودرتو را به یک آرایه تبدیل می‌کند
                    .join('\n'); // هر خطا را در یک خط جدید نمایش می‌دهد
                if (specificErrors) {
                    errorMessage = specificErrors;
                }
            }
            setSaveError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // ... بقیه توابع بدون تغییر ...
    const removeConnection = (connectionId) => {
        setConnections(prevConnections => prevConnections.filter(conn => conn.id !== connectionId));
    };

    const drawLines = useCallback(() => {
    if (!svgRef.current || !containerRef.current || modalStep !== 'matching') return;

    const svgElement = svgRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();

    // پاک کردن خط‌های قبلی
    svgElement.innerHTML = '';

    connections.forEach(conn => {
        const leftElement = document.getElementById(`field-${conn.from.id}`);
        const rightElement = document.getElementById(`field-${conn.to.id}`);
         console.log(leftElement, rightElement)
        // اگه یکی از المنت‌ها وجود نداشت، هیچی نکش
        if (!leftElement || !rightElement) return;

        const leftButton = leftElement.querySelector(`.${styles.left}`);
const rightButton = rightElement.querySelector(`.${styles.right}`);


        // اگه دکمه‌ها پیدا نشدن، خط نکش
        if (!leftButton || !rightButton) return;

        const leftRect = leftButton.getBoundingClientRect();
        const rightRect = rightButton.getBoundingClientRect();

        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;

        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
        console.log(x1, y1, x2, y2)

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#69b0b2');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('class', styles['connection-line']);

        const pathId = `${conn.from.id}-${conn.to.id}`;
        line.setAttribute('data-path-id', pathId);

        // کلیک روی خط = حذف اتصال
        line.addEventListener('click', () => removeConnection(pathId));

        svgElement.appendChild(line);
    });
}, [connections, modalStep, styles]);

useLayoutEffect(() => {
  if (isOpen && modalStep === 'matching') {
    drawLines();
    window.addEventListener('resize', drawLines);
    return () => window.removeEventListener('resize', drawLines);
  }
}, [connections, isOpen, modalStep, drawLines]);




    if (!isOpen) return null;

    const handleLeftFieldClick = (field) => {
        if (connections.some(conn => conn.from.id === field.id)) return;
        setConnectingField(field);
    };

    const handleRightFieldClick = (field) => {
        if (!connectingField || connections.some(conn => conn.to.id === field.id)) return;
        const newConnection = {
            id: `${connectingField.id}-${field.id}`, // مثلا left-3-right-5
            from: connectingField,
            to: field,
        };
  

        setConnections(prevConnections => [...prevConnections, newConnection]);
        setConnectingField(null);
    };

    return (
        <div className={styles['modal-overlay']} onClick={handleClose}>
            <div className={styles['modal-container']} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <div className={styles['modal-header-text']}>
                        <button className={styles['close-button']} onClick={handleClose}>&times;</button>
                        <h2>{modalStep === 'upload' ? 'آپلود فایل اکسل' : 'سربرگ‌ها را به یکدیگر وصل کنید'}</h2>
                        <p>{modalStep === 'upload' ? 'فایل اکسل دانش‌آموزان را برای تطبیق سربرگ‌ها آپلود کنید.' : 'به دلیل اینکه اشتباهی در لیست‌ها و آمار به وجود نیاید، سربرگ‌های سبز رنگ را به هم نامشان وصل کنید.'}</p>
                    </div>
                    {/* <button className={styles['info-button']}>راهنما</button> */}
                    <div />
                </div>

                {/* ** بخش جدید برای نمایش خطاها ** */}
                {saveError && (
                    <div className={styles['save-error-container']}>
                        <p>{saveError}</p>
                    </div>
                )}
                {modalStep === 'matching' && (
                    <div className={styles['field-title']}>
                        <p>لیست دانش‌آموزان</p>
                        <p>فایل اکسل</p>
                    </div>
                )}

                <div className={styles['modal-body']} ref={containerRef}>
                    {modalStep === 'upload' ? (
                        <ExcelUploader
                            onUploadSuccess={handleFileUploadSuccess}
                            isUploading={isUploading}
                            setIsUploading={setIsUploading}
                            uploadError={uploadError}
                            setUploadError={setUploadError}
                        />
                    ) : (
                        <>

                            <div className={styles['field-list-right']}>
                                {rightFields.map(field => (
                                    <div key={field.id} id={`field-${field.id}`} className={`${styles['field-item']} ${connections.some(c => c.to.id === field.id) ? styles.connected : ''}`} onClick={() => handleRightFieldClick(field)}>
                                        <span className={styles['field-name']}>{field.name}</span>
                                        <div className={`${styles['connect-button']} ${styles.right}`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles['field-list-left']}>
                                {leftFields.map(field => (
                                    <div key={field.id} id={`field-${field.id}`} className={`${styles['field-item']} ${connectingField?.id === field.id ? styles.connectingg : ''} ${connections.some(c => c.from.id === field.id) ? styles.connectedd : ''}`} onClick={() => handleLeftFieldClick(field)}>
                                        <span className={styles['field-name']}>{field.name}</span>
                                        <button className={`${styles['connect-button']} ${styles.left}`}>+</button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles['connection-area']}>
                                <svg className={styles['connection-svg']} ref={svgRef}></svg>
                            </div>
                        </>
                    )}
                    {modalStep === 'matching' && (
                        <button
                            className={styles['save-button']}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'در حال ثبت...' : 'ثبت'}
                        </button>
                    )}
                </div>


            </div>
        </div>
    );
};

export default MatchingModal;