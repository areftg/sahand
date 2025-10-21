import React from 'react'
import style from "./BackButton.module.css"
import back from "../../assets/icons/back.svg"

import { useNavigate } from 'react-router-dom';

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <div onClick={() => { navigate(-1) }} className={style.backButton}>
            <img src={back} alt='' />
            <p>بازگشت</p>
        </div>
    )
}
