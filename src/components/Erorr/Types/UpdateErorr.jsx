import React from 'react'
import Erorr from '../Erorr'
import notfound from "../../../assets/icons/update.svg"

export default function PageNotFound() {
  return (
    <div>
      <Erorr pic={notfound} text={"در حال بروزرسانی هستیم!"} but={"بارگزاری مجدد"}/>
    </div>
  )
}
