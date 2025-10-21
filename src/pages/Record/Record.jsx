import React from 'react'
import DashboardTile from '../../components/DashboardTile/DashboardTile';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import IssueReportCard from '../../components/IssueReportCard/IssueReportCard';
import RecordList from '../../components/RecordList/RecordList'
import style from './Record.module.css'
import { useAuth } from "../../Context/AuthContext";


export default function Record () {
  const { user } = useAuth();


  return (
    <div className={style.Record}>
     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content'>
     {/* {user?.role !== 'teacher' && (<IssueReportCard/>)} */}
     <RecordList/>
     </div>
     </div>
    </div>
  )
}
