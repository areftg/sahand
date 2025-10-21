import History from "../../assets/icons/History.svg"
import List from '../../assets/icons/doc-list.svg'
import Pan from "../../assets/icons/pan.svg"
import Trash from "../../assets/icons/Trash.svg"
import Editcheck from "../../assets/icons/Editcheck.svg"
import Print from "../../assets/icons/print.svg"
import style from './Row.module.css'
import DynamicTooltip from "../../components/DynamicTooltip/DynamicTooltip";
import { useState } from "react"

export default function Row() {

  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={style.row}>
      <div className={style.top}>
        <div className={style.itemcontainer}>
          <div className={style.item}>
            <p>1</p>
          </div>
          <div className={style.item}>
            <p>۱۴۰۴/۰۴/۰۳</p>
          </div>
          <div className={style.item}>
            <div className={style.text}>
              <DynamicTooltip content="این یک متن خیلی طولانی است که باید کامل نمایش داده شود وقتی موس روی آن برود.">
                <p className={style.textShort}>پرداخت مبالغ موردنیاز برای اجرای طرح‌های پژوهشی، خرید منابع، برگزاری کارگاه‌ها و حمایت از فعالیت‌های علمی و تحقیقاتی دانش‌آموزان.</p>
              </DynamicTooltip>
            </div>
          </div>
          <div className={`${style.item} ${style.leftitem}`} onClick={handleToggle}>
            <p>1</p>
            <div className={style.Dropdown}>
              <svg className={`${style.arrowIcon} ${isExpanded ? style.rotate : ''}`}
                width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="white" />
              </svg>
            </div>
          </div>


        </div>
        <div className={style.buttoncontainer}>
          <button className={style.button}>
            <img src={Pan} alt="list icon" />
          </button>
          <button className={style.button}>
            <img src={Trash} alt="list icon" />
          </button>
          <button className={style.button}>
            <img src={Print} alt="list icon" />
          </button>
          <button className={style.button}>
            <img src={Editcheck} alt="list icon" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <>
          <div className={style.dash}></div>

          <div className={style.center}>
            <div className={style.itemcontainer}>
              <div className={style.item}>
                <p>1</p>
              </div>
              <div className={style.item}>
                <p>۱۴۰۴/۰۴/۰۳</p>
              </div>
              <div className={style.item}>
                <div className={style.text}>
                  <p className={style.textShort}>مبلغ: ۳۰،۰۰۰،۰۰۰</p>
                </div>
              </div>
              <div className={style.item}>
                <p>در وجه: علیرضا افتخاری</p>
              </div>
            </div>
            <div className={style.buttoncontainer}>
              <button className={style.button}><img src={Pan} alt="list icon" /></button>
              <button className={style.button}><img src={Trash} alt="list icon" /></button>
              <button className={style.button}><img src={Print} alt="list icon" /></button>
              <button className={style.button}><img src={Editcheck} alt="list icon" /></button>
            </div>
          </div>

          <div className={style.center}>
            <div className={style.itemcontainer}>
              <div className={style.item}>
                <p>1</p>
              </div>
              <div className={style.item}>
                <p>۱۴۰۴/۰۴/۰۳</p>
              </div>
              <div className={style.item}>
                <div className={style.text}>
                  <p className={style.textShort}>مبلغ: ۳۰،۰۰۰،۰۰۰</p>
                </div>
              </div>
              <div className={style.item}>
                <p>در وجه: علیرضا افتخاری</p>
              </div>
            </div>
            <div className={style.buttoncontainer}>
              <button className={style.button}><img src={Pan} alt="list icon" /></button>
              <button className={style.button}><img src={Trash} alt="list icon" /></button>
              <button className={style.button}><img src={Print} alt="list icon" /></button>
              <button className={style.button}><img src={Editcheck} alt="list icon" /></button>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
