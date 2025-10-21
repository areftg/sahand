import React from 'react'
import style from "./Erorr.module.css"

import { useNavigate } from 'react-router-dom';


export default function Erorr({pic,text,but}) {


  const navigate = useNavigate();

  
  const handleGoBack = () => {
   
    navigate(-1);
  }

  return (

<div className={style.container} >
    <div className={style.title} >
       <h2>{text}</h2>
       {but && <button onClick={handleGoBack}>{but}</button>}
    </div>

       <div className={style.loader}>
        <div className={style.box}>
          <div className={style.Logo}>
            <img src={pic} alt=""  />
          </div>
        </div>
        <div className={style.box} />
         <div className={style.box} />
          <div className={style.box} />
           <div className={style.box} />
        </div>

</div>
  )
}

