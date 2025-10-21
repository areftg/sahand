import React from 'react'
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pdashboard from "../../components/Pdashboard/Pdashboard"



export default function Parent() {
  return (
    <div className='Dashboard'>
    <Header/>
    <div className='App-Container'>
    <Sidebar/>
    <div className='Main-Content'>
    <Pdashboard/>
    </div>
    </div>
   </div>
  )
}
