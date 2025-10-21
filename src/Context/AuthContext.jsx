import { createContext, useContext, useState, useEffect } from 'react';
import api, { endpoints, setAuthToken } from "../config/api.js";
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ اول true باشه چون داریم auth رو چک می‌کنیم

  // ⬅️ هنگام شروع، داده از localStorage خونده میشه
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAuthToken(parsedUser.token);
      
    }
    setLoading(false); // ⬅️ حتما بعد از چک، loading باید false بشه
  }, []);

  const login = (data) => {
    const { token, roles = [], schools = [], ...rest } = data;
  
    const fullUser = {
      ...rest,
      token,
      roles, // ✅ آرایه رول‌ها
      role: roles?.[0] || null, // ← فقط برای سازگاری با کدهای قدیمی، اولین رول
      schools, 
      selectedSchool: schools.length === 1 ? schools[0] : null,
    };
  
    setUser(fullUser);  
    localStorage.setItem('user', JSON.stringify(fullUser));
    localStorage.setItem('token', token);
    setAuthToken(token);
  };
  

  const logout = () => {
    setUser(null);
    api.post(endpoints.logout);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('school_id');
    setAuthToken(null); // ✅ اینم اضافه کن
  };

  const refresh = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('school_id');
    window.location.reload();
  };


  const selectSchool = (school) => {
    if (!user) return;
  
    const updatedRoles = school.current_user_roles?.length > 0
      ? school.current_user_roles
      : user.roles || [];
  
    const primaryRole = updatedRoles[0] || user.role || null;
  
    const updatedUser = {
      ...user,
      selectedSchool: school.id,
      roles: updatedRoles,   // ✅ مطمئن میشیم همیشه آرایه‌ست
      role: primaryRole,     // ✅ رول اصلی
    };
  
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  
  

  





  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser, refresh, selectSchool }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
