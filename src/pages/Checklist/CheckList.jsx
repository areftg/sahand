import style from './Checklist.module.css';
import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Add from '../../assets/icons/add.svg';
import Check from '../../components/Check/Check';
import AddCheck from '../../components/AddCheck/AddCheck';

export default function CheckList() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSuccess = () => {
    console.log('CheckList: handleAddSuccess called');
    setRefreshKey(prev => prev + 1); // Force re-render of Check component
  };

  return (
    <div className={style.CheckList}>
      <Header />
      <div className='App-Container'>
        <Sidebar />
        <div className='Main-Content'>
          <div className={style.balance}>
            <div className={style.price}>
              <h1>لیست دسته چک‌ها</h1>
            </div>
            <div onClick={() => setShowModal(true)} className={style.button}>
              <img src={Add} alt="آیکون افزودن" />
              <p>دسته چک جدید</p>
            </div>
          </div>
          <Check refreshKey={refreshKey} onAddSuccess={handleAddSuccess} />
        </div>
      </div>
      <AddCheck isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleAddSuccess} />
    </div>
  );
}