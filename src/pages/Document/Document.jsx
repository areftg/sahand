import style from './Document.module.css'
import React from 'react'
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import DocumentFrame from '../../components/DocumentFrame/DocumentFrame';


export default function Document() {
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
