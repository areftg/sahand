import React from "react";
import style from "./StudentRow.module.css";
import Graph from "../../assets/icons/Graph.svg";
import Tic from "../../assets/icons/Tic.svg";
import drop from "../../assets/icons/Drop.svg";
import circleclose from "../../assets/icons/circleclose.svg";
import late from "../../assets/icons/late.svg";
import { Link } from "react-router-dom";

export default function StudentRow({ student, index, status, openDropdownId, setOpenDropdownId, setStatus }) {
  return (
    <div key={student.enrollment_id} className={style.row}>
      <div className={`${style.item} ${style.display}`}>
        <p>{index + 1}</p>
      </div>
      <div className={style.item}>
        <p>{student.first_name}</p>
      </div>
      <div className={`${style.item} ${style.display}`}>
        <p>{student.last_name}</p>
      </div>
      <div className={`${style.item} ${style.display}`}>
        <p>{student.father_name || '-----------'}</p>
      </div>
      <Link to={`/student/${student.enrollment_id}`} className={style.delete}>
        <img src={Graph} alt="مشاهده سوابق" />
        <p>مشاهده سوابق</p>
      </Link>

      <div className={style.status}>
        {/* وضعیت اصلی */}
        <div
          className={`${style.editStatus} ${style[status]}`}
          onClick={() => {
            if (status === "present") {
              setStatus(student.enrollment_id, "absent");
            } else {
              setOpenDropdownId(
                openDropdownId === student.enrollment_id ? null : student.enrollment_id
              );
            }
          }}
        >
          <p>
            
            {status === "present" && "حاضر"}
            {status === "absent" && "غایب"}
            {status === "tardy" && "تاخیر"}
          </p>
          <div
            className={`${style.checkbox} ${
              status === "present"
                ? style.checkboxPresent
                : status === "absent"
                ? style.checkboxAbsent
                : style.checkboxLate
            }`}
          >
            <img
              src={
                status === "present"
                  ? Tic
                  : status === "absent"
                  ? circleclose
                  : late
              }
              alt="وضعیت"
            />
          </div>
        </div>

        {/* دکمه دراپ‌داون */}
        {status !== "present" && (
          <div
            className={`${style.drop} ${style[status]} ${openDropdownId === student.enrollment_id ? style.activeDrop : ""}`}
            onClick={() =>
              setOpenDropdownId(
                openDropdownId === student.enrollment_id ? null : student.enrollment_id
              )
            }
          >
            <img src={drop} alt="" />
          </div>
        )}

        {/* منوی دراپ‌داون */}
        {openDropdownId === student.enrollment_id && (
          <div className={style.dropdownMenu}>
            <div
              className={style.dPresent}
              onClick={() => {
                setStatus(student.enrollment_id, "present");
                setOpenDropdownId(null); // بستن منو
              }}
            >
              <div className={style.circle}>
                {status === "present" && <div className={style.filled}></div>}
              </div>
              <p>حاضر</p>
            </div>
            <div
              className={style.dAbsent}
              onClick={() => {
                setStatus(student.enrollment_id, "absent");
                setOpenDropdownId(null);
              }}
            >
              <div className={style.circle}>
                {status === "absent" && <div className={style.filled}></div>}
              </div>
              <p>غایب</p>
            </div>
            <div
              className={style.dLate}
              onClick={() => {
                setStatus(student.enrollment_id, "tardy");
                setOpenDropdownId(null);
              }}
            >
              <div className={style.circle}>
                {status === "tardy" && <div className={style.filled}></div>}
              </div>
              <p>تاخیر</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
