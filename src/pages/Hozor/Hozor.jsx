import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';

import { AbsenceProvider } from '../../Context/AbsenceContext';
import { Outlet } from 'react-router-dom';
import HozorDeck from '../../components/HozorDeck/HozorDeck';

export default function Hozor() {
  return (
    <div className='Dashboard'>
      <Header />
      <div className='App-Container'>
        <Sidebar />
        <div className='Main-Content'>
          <AbsenceProvider>
            <HozorDeck />
            <Outlet />
          </AbsenceProvider>
        </div>
      </div>
    </div>
  );
}
