import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import style from './AddClass.css';
import Class from '../../components/Class/Class';

export default function AddClass() {
  return (
    <div className='Dashboard'>
     <Header/>
     <div className='App-Container'>
     <Sidebar/>
     <div className='Main-Content' id='main'>
        <Class/>
     </div>
     </div>
    </div>
  )
}
