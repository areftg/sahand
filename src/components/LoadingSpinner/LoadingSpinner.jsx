import React from 'react';
import styles from './LoadingSpinner.module.css'; // ایمپورت CSS Module

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingSpinner;