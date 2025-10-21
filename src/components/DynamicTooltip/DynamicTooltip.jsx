import React, { useRef, useState } from "react";
import styles from "./DynamicTooltip.module.css";

export default function DynamicTooltip({ children, content, minLength = 20 }) {
  const ref = useRef(null);
  const [direction, setDirection] = useState("bottom");
  const [visible, setVisible] = useState(false);

  const handleMouseEnter = () => {
    if (!content || content.length <= minLength) return; // 👈 فقط اگر طولش زیاد بود ادامه بده

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (windowHeight - rect.bottom < 120) {
      setDirection("top");
    } else {
      setDirection("bottom");
    }

    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const shouldShowTooltip = content && content.length > minLength;

  return (
    <div
      className={styles.wrapper}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && shouldShowTooltip && (
        <div className={`${styles.tooltip} ${styles[direction]}`}>
          {content}
        </div>
      )}
    </div>
  );
}
