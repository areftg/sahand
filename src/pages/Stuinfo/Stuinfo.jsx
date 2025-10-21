import React, { useState, useEffect } from 'react';
import api, { endpoints } from "../../config/api";

import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import StudentInfoTile from "../../components/StudentInfoTile/StudentInfoTile";
import { useParams } from 'react-router-dom';

import { Outlet } from 'react-router-dom';

export default function Stuinfo() {
  const { studentId } = useParams();
        const [Data, setData] = useState();
        const [error, setError] = useState(null);
  
         useEffect(() => {
      if (!studentId) {
        return; 
      }

      const fetchAbsenceData = async () => {
      try {
        const response = await api.get(endpoints.student(studentId));
        
       
        const apiData = response.data.data; 
        
       
         setData(apiData)
        

      } catch (err) {
        console.error("خطا در دریافت اطلاعات نمودار:", err);
        setError("متاسفانه در بارگذاری اطلاعات مشکلی پیش آمد.");
      }
    };

    fetchAbsenceData();
  }, [studentId]);

  return (
    <div className='Dashboard'>
    <Header/>
    <div className='App-Container'>
    <Sidebar/>
    <div className='Main-Content'>
    <StudentInfoTile studata={Data} />
    <Outlet context={{ studata: Data }} />
    </div>
    </div>
   </div>
  )
}
