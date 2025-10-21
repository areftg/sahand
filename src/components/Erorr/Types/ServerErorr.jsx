import React from 'react'
import Erorr from '../Erorr'
import server from "../../../assets/icons/server.svg"

export default function PageNotFound() {
  return (
    <div>
      <Erorr pic={server} text={"سرور دچار مشکل شده است"} but={"بارگزاری مجدد"}/>
    </div>
  )
}
