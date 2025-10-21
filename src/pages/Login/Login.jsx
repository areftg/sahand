import React from 'react'
import "./Login.css"
import LoginTile from '../../components/LoginTile/LoginTile'
import LoginFooter from '../../components/LoginFooter/LoginFooter'
import LoginImg from "../../components/LoginImg/LoginImg"
import News from '../../components/News/News'
import SelectSchool from '../../Context/SelectSchool'
import { useLocation } from 'react-router-dom';
import { setSchoolIdHeader } from "../../config/api";
import LoginEmail from '../../components/LoginEmail/LoginEmail'


export default function Login() {
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const step = queryParams.get('step');



  return (
    <div className='Login-back'>
      <div className='Login-container'>
      <div className='Login'>
      <div className='Login--Right'>
        {step === 'selectSchool' ? <SelectSchool/> : <LoginTile />}
        <LoginFooter />
      </div>
      <div className='Login--Left'>
         <LoginImg />
         <LoginEmail/>
         <News />
      </div>
    </div>
    </div>
    </div>
  )
}
