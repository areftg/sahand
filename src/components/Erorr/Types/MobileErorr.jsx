import React from 'react'
import Erorr from '../Erorr'
import access from "../../../assets/icons/ErorrA.svg"

export default function MobileErorr() {
  return (
    <div>
      <Erorr pic={access} text={"دسترسی مجاز نیست!"} but={"برگشت به صفحه قبل"}/>
    </div>
  )
}
