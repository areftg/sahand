import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

// یک کامپوننت ساده برای نمایش وضعیت لودینگ
// می‌توانید این را با یک اسپینر گرافیکی زیبا جایگزین کنید
const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>در حال بارگذاری...</h2>
    </div>
);

const PrivateRoute = () => {
    // هر دو مقدار user و loading را از Context دریافت می‌کنیم
    const { user, loading } = useAuth();

    // مرحله ۱: بررسی وضعیت لودینگ
    // اگر برنامه هنوز در حال بررسی اطلاعات کاربر از localStorage است،
    // یک صفحه لودینگ نمایش می‌دهیم تا از هدایت زودهنگام جلوگیری کنیم.
    if (loading) {
        return <LoadingSpinner />;
    }

    // مرحله ۲: تصمیم‌گیری نهایی بعد از اتمام لودینگ
    // وقتی لودینگ تمام شد، با خیال راحت بر اساس وجود یا عدم وجود کاربر
    // اجازه دسترسی می‌دهیم یا به صفحه لاگین هدایت می‌کنیم.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;