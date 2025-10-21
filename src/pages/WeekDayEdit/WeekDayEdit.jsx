import React from 'react'
import style from "./WeekDayEdit.module.css"
import WeekDayEditor from "../../components/WeekDayEditor/WeekDayEditor"
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';



export default function WeekDayEdit() {
  return (
    <div className='Dashboard'>
     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content' id='main'>
      <WeekDayEditor/>
 
     </div>
     </div>
    </div>
  )
}
