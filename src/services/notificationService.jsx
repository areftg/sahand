import { toast } from 'react-toastify';


import WarningIcon from '../assets/icons/warning.svg';
import SuccessIcon from '../assets/icons/success.svg';
import InfoIcon from '../assets/icons/infoicon.svg';
import ErrorIcon from '../assets/icons/erorrs.svg';
import NoInternetIcon from '../assets/icons/nointenet.svg';
import CloseIcon from '../assets/icons/closee.svg'; 


// src/services/notificationService.js
// ... (imports و بقیه کدها) ...

// کامپوننت سفارشی برای دکمه بستن (ضربدر سمت چپ)
const CustomCloseButton = ({ closeToast }) => (
  <img src={CloseIcon}  alt="close" className="notif-close-but" onClick={closeToast} />
);

const defaultOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false, // مخفی کردن نوار پیشرفت
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored", 
  
  closeButton: CustomCloseButton // اعمال دکمه بستن سفارشی
};




const showCustomNotification = (type, message, customIcon, options = {}) => {
  const finalOptions = {
    ...defaultOptions,
    ...options,
    icon: customIcon,
  };

  switch (type) {
    case 'success':
      toast.success(message, finalOptions);
      break;
    case 'error':
      toast.error(message, finalOptions);
      break;
    case 'warning':
      toast.warn(message, finalOptions);
      break;
    case 'info':
      toast.info(message, finalOptions);
      break;
    case 'no-internet':
        
        toast(message, { ...finalOptions, className: 'Toastify__toast--no-internet' });
        break;
    default:
      toast(message, finalOptions);
  }
};


export const showSuccessNotification = (message, options = {}) => {
  showCustomNotification('success', message, <img className='notif-pic' src={SuccessIcon} alt="success" />, options);
};

export const showErrorNotification = (message, options = {}) => {
  showCustomNotification('error', message, <img src={ErrorIcon} alt="error" />, options);
};

export const showWarningNotification  = (message, options = {}) => {
  showCustomNotification('warning', message, <img src={WarningIcon} alt="warning" />, options);
};

export const showInfoNotification = (message, options = {}) => {
  showCustomNotification('info', message, <img src={InfoIcon} alt="info" />, options);
};

export const showNoInternetNotification = (message, options = {}) => {
  showCustomNotification('no-internet', message, <img src={NoInternetIcon} alt="no-internet" />, options);
};


export const showComplexInfoNotification = (messageContent, buttonText, onButtonClick, options = {}) => {
    const content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px',boxShadow:"black 2px 4px 2px 2px" }}>
           <div className='notif-message'> {messageContent}</div>
           
            {buttonText && onButtonClick && (
                <button
                    style={{
                        padding: '8px 15px',
                        backgroundColor: '#5bc0de',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        alignSelf: 'flex-start' 
                    }}
                    onClick={onButtonClick}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
    showCustomNotification('info', content, <img src={InfoIcon} alt="info" />, options);
};