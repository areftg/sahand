// components/CheckSchool.jsx
import { useContext ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckSchool = () => {
  const navigate = useNavigate();

    

  const userString = localStorage.getItem('user');

  useEffect(() => {
    if (!userString) return;

    try {
      const user = JSON.parse(userString);
      if (!user.selectedSchool) {
        navigate('/login?step=selectSchool');
      }
    } catch (error) {
      console.error("User data in localStorage is not valid JSON", error);
      navigate('/login?step=selectSchool');
    }
  }, [navigate, userString]);

  return null;
};


export default CheckSchool;
