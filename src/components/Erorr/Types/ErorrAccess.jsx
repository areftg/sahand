import React from 'react'
import Erorr from '../Erorr'
import access from "../../../assets/icons/ErorrA.svg"
import Header from '../../Header/Header'
import Sidebar from '../../Sidebar/Sidebar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../../Context/AuthContext";

export default function ErorrAccess() {
 const {user} = useAuth();
  const schoolId = user?.school_id;
  return (
       <div className='Dashboard'>
                <Header/>
                <div className='App-Container'>
                {schoolId && <Sidebar/>}
                <div className='Main-Content'>
                  <Erorr pic={access} text={"دسترسی مجاز نیست!"} but={"برگشت به صفحه قبل"}/>
                </div>
                </div>
               </div>
  )
}


