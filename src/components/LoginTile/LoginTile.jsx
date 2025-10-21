import React, { useState, useEffect } from 'react';
import style from "./LoginTile.module.css";
import logo from '../../assets/icons/sjm-logo-green.svg';
import userr from '../../assets/icons/user.svg';
import axios from 'axios';
import api, { endpoints } from '../../config/api';
import { useAuth } from '../../Context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import FetchSchools from "../../Context/FetchSchools.jsx"
import Loading from "../LoadingSpinner/LoadingSpinner.jsx"
import { setAuthToken } from "../../config/api.js";
import CheckSchool from '../../Context/CheckSchool.jsx'
import userpic from "../../assets/icons/userpic.svg"
import eyeopen from "../../assets/icons/eye-open.svg"
import eyeclose from "../../assets/icons/eye-close.svg"

export default function LoginTile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember_me, setRemember_me] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const [backendMessage, setBackendMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loading, setLoading] = useState(false);

  const handleBeforeInput = (e) => {
    const char = e.data;
    if (char && /[\u0600-\u06FF]/.test(char)) {
      e.preventDefault();
      setBackendMessage("لطفاً کیبورد خود را روی زبان انگلیسی قرار دهید.");
    } else {
      setBackendMessage("");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('school_id');
    }
  }, []);

  const handleChangeUsername = (e) => {
    const val = e.target.value;
    setUsername(val.replace(/[\u0600-\u06FF]/g, ""));
  };

  const handleChangePassword = (e) => {
    const val = e.target.value;
    setPassword(val.replace(/[\u0600-\u06FF]/g, ""));
  };

  const validateUsername = () => {
    if (username.length >= 3) {
      return true;
    } else {
      return false;
    }
  };

  const validatePassword = () => {
    if (password.length >= 8) {
      return true;
    } else {
      return false;
    }
  };

  const { login } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUser } = useAuth();
  const [shouldCheckSchool, setShouldCheckSchool] = useState(false);

  const handleLogin = async () => {
    setShouldCheckSchool(true);

    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (isUsernameValid && isPasswordValid) {
      setLoading(true);
      try {
        const response = await api.post(endpoints.login, {
          username,
          password,
          remember_me,
        });

        console.log("ورود موفق ✅", response.data);
        
        setBackendMessage(response.data.message || "ورود موفق بود");
        setMessageType("success");

        const { token, user } = response.data.data;

        const userData = {
          ...user,
          token,
          roles: user.roles,
        };

        login(userData);

        if (response.data.status) {
          const userRole = user.roles?.[0]?.name || '';

          if (['admin', 'principal', 'deputy'].includes(userRole)) {
            navigate('/');
          } else if (userRole === 'teacher') {
            navigate('/Hozor/hozor');
          } else {
            navigate('/error');
          }
        }
      } catch (error) {
        setBackendMessage(error.response?.data?.message || 'نام کاربری یا رمز عبور اشتباه است');
      } finally {
        setLoading(false);
      }
    } else {
      console.log("مشکلات اعتبارسنجی وجود دارد ❌");
      
      if (!username || !password) {
        setBackendMessage('لطفاً همه فیلدها را پر کنید.');
      } else {
        setBackendMessage('نام کاربری یا رمز عبور وارد شده نامعتبر است');
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={style.container}>
      <div className={style.center}>
        {shouldCheckSchool && <CheckSchool />}
        {!backendMessage && (
          <div className={style.pic}>
            <img src={userr} alt='' />
            <div />
            <img src={logo} alt='' />
          </div>
        )}

        {backendMessage && (
          <div className={`${style.message} ${style[messageType]}`}>
            <span>{backendMessage}</span>
          </div>
        )}

        <h1 className={style.title}>ورود به حساب کاربری</h1>

        {/* نام کاربری */}
        <div className={style.input}>
          <input
            type="text"
            value={username}
            onBeforeInput={handleBeforeInput}
            onChange={handleChangeUsername}
            onBlur={validateUsername}
            placeholder="نام کاربری"
          />
        </div>

        {/* رمز عبور */}
        <div className={style.input}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onBeforeInput={handleBeforeInput}
            onChange={handleChangePassword}
            onBlur={validatePassword}
            placeholder="رمز عبور"
          />
          <button
            type="button"
            className={style.eyeButton}
            onClick={togglePasswordVisibility}
          >
            <img
              src={showPassword ? eyeclose : eyeopen}
              alt={showPassword ? "Hide password" : "Show password"}
            />
          </button>
        </div>

        <div className={style.checkboxWrapper}>
          <label>
            <input
              type="checkbox"
              checked={remember_me}
              onChange={(e) => setRemember_me(e.target.checked)}
            />
            مرا به خاطر بسپار
          </label>
        </div>
        
        <div className={style.buttoncontainer}>
          <button onClick={handleLogin} disabled={loading}>
            {loading ? <Loading /> : "ورود به سامانه"}
          </button>
        </div>

        <a href="https://www.google.com">رمز عبور خود را فراموش کردم!</a>
      </div>
    </div>
  );
}