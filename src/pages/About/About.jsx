import React from 'react'
import style from "./About.module.css"
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import AboutUs from '../../components/AboutUs/AboutUs.jsx';

export default function About() {
  return (
    <div className='Dashboard'>
     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content' id='main'>
       <AboutUs/>
      
     </div>
     </div>
    </div>
  )
}
