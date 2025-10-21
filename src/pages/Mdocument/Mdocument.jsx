import style from './Mdocument.module.css'
import React from 'react'
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import DocumentFrame from '../../components/MeetingFrame/MeetingFrame';


export default function Mdocument() {
  return (
    <div className={style.Document}>

     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content'>
       <DocumentFrame>
        <Outlet/>
       </DocumentFrame>
     </div>
     </div>
  
    </div>
  )
}
