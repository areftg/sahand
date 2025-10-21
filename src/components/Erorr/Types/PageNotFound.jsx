import React from 'react'
import Erorr from '../Erorr'
import notfound from "../../../assets/icons/NotFound.svg"
import Header from '../../Header/Header'
import Sidebar from '../../Sidebar/Sidebar'
export default function PageNotFound() {
  return (
         <div className='Dashboard'>
            <Header/>
            <div className='App-Container'>
            <Sidebar/>
            <div className='Main-Content'>
               <Erorr pic={notfound} text={"صفحه ای که درخواست کرده اید،موجود نمی باشد."} but={"برگشت  به صفحه قبل"}/>
            </div>
            </div>
           </div>

  )
}
