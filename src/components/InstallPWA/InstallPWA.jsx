import React, { useState, useEffect } from 'react';
import styles from './InstallPWA.module.css';
import pwa from "../../assets/icons/pwa.svg";

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // اگر کاربر قبلاً گفته "دیگه نمایش نده"
    if (localStorage.getItem('hidePwaPrompt') === 'true') return;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setTimeout(() => setIsModalVisible(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
    setIsModalVisible(false);
  };

  const handleDismissClick = () => {
    if (dontShowAgain) {
      localStorage.setItem('hidePwaPrompt', 'true');
    }
    setIsModalVisible(false);
  };

  const handleCheckboxChange = (e) => {
    setDontShowAgain(e.target.checked);
  };

  if (!isModalVisible) return null;

  return (
    <div className={styles['pwa-modal-overlay']}>
      <div className={styles['pwa-modal-content']}>
        <img src={pwa} alt="App Logo" className={styles['pwa-modal-logo']} />
        <h2>نصب نرم‌افزار</h2>
        <p>
          برای تجربه کاربری بهتر، توصیه می‌شود که نرم‌افزار را نصب کنید! برای نصب کافیست روی ادامه بزنید و سپس روی دکمه Install یا نصب کلیک کنید.
        </p>

        {/* چک‌باکس برای عدم نمایش دوباره */}
        <div className={styles['pwa-checkbox']}>
          <label>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
            />
            دیگه نمایش نده
          </label>
        </div>

        <div className={styles['pwa-modal-buttons']}>
          <button className={styles['pwa-install-button']} onClick={handleInstallClick}>
            نصب
          </button>
          <button className={styles['pwa-dismiss-button']} onClick={handleDismissClick}>
            فعلاً نه
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
