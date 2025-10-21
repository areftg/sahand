import React from 'react'
import Erorr from '../Erorr'
import notfound from "../../../assets/icons/ban.svg"

export default function PageNotFound() {
  return (
    <div>
      <Erorr pic={notfound} text={"حساب کاربری مسدود است."} />
    </div>
  )
}
