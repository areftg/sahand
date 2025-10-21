import React from 'react'
import style from "./Loading.module.css"
import sjm from "../../assets/icons/loadingsahand.svg"
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

export default function Loading() {



  return (

    <div className={style.container} >


      <div className={style.back}>

        <img src={sjm} alt="SJM Logo"></img>
        <div>
          <div className={style.spiner}>
            <LoadingSpinner />
          </div>
          <h2>در حال بارگزاری اطلاعات...</h2>
        </div>
      </div>

    </div>
  )
}

