import React from 'react'
import style from "./Subscribe.module.css"
import CloseIcon from '../../assets/icons/closee.svg';

export default function Subscribe({ onClose }) {
  return (
    <div className={style.Subscribe}>
      <img className={style.profilePanelIcon} src={CloseIcon} alt='بستن' onClick={onClose} />
      <h3>اشتراک ویژه</h3>
      <div className={style.content}>
        <div className={style.section}>
          <p>روزهای باقیمانده:</p><p>189</p>
        </div>
        <div className={style.section}>
          
        </div>
        <div className={style.section}>
           <button>ویرایش اشتراک</button>
            <button>تمدید اشتراک</button>
        </div>
      </div>
    </div>
  )
}
