import React from 'react'
import "./ParentDashboard.css"
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import PDashboardHeader from "../../components/PDashboardHeader/PDashboardHeader"



export default function ParentDashboard() {
  return (
    <div className='Dashboard'>
    <Header/>
    <div className='App-Container'>
    <Sidebar/>
    <div className='Main-Content AbsoloteMain'>
    <PDashboardHeader/>
    <Outlet/>
    </div>
    </div>
   </div>
  )
}