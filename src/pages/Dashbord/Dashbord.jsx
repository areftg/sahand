import React from 'react'
import "./Dashbord.css"
import DashboardTile from '../../components/DashboardTile/DashboardTile';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from "react-router-dom";
import axios from 'axios';


export default function Dashbord() {


  return (
    <div className='Dashboard'>
     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content' id='main'>
     <DashboardTile/>
     <Outlet />
     </div>
     </div>
    </div>
  )
}
