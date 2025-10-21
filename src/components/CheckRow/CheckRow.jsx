// CheckRow.jsx
import { useState } from "react";
import QuestionBox from "../../components/QuestionBox/QuestionBox";
import style from "./CheckRow.module.css";
import Editcheck from "../../assets/icons/Editcheck.svg";
import Trash from "../../assets/icons/Trash.svg";

export default function CheckRow({ id, date, num1, num2, val1, val2, isChecked, onCheck }) {
  const [showQuestion, setShowQuestion] = useState(false);

  const handleCheckboxClick = () => {
    setShowQuestion(true);
  };

  const handleConfirm = () => {
    onCheck(id); // والد رو خبر کن
    setShowQuestion(false);
  };

  return (
    <>
      <div className={style.row}>
        <div className={style.item}><p>{id}</p></div>
        <div className={style.item}><p>{date}</p></div>
        <div className={style.item}><p>{num1}</p></div>
        <div className={style.item}><p>{num2}</p></div>
        <div className={style.item}><p>{val1}</p></div>
        <div className={style.item}><p>{val2}</p></div>

        <button
          onClick={handleCheckboxClick}
          className={`${style.button} ${style.button1}`}
        >
          <div className={style.checkbox}>
            {isChecked && <div className={style.innerCircle}></div>}
          </div>
        </button>

        <button className={style.button}>
          <img src={Editcheck} alt="edit icon" />
        </button>
        <button className={style.button}>
          <img src={Trash} alt="trash icon" />
        </button>
      </div>

      {showQuestion && (
        <QuestionBox
          message="آیا مطمئن هستید که این چک جاری شود؟"
          onConfirm={handleConfirm}
          onCancel={() => setShowQuestion(false)}
        />
      )}
    </>
  );
}
