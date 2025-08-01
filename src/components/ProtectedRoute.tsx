import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
  
  // 检查登录是否过期（24小时）
  const loginTime = localStorage.getItem('admin_login_time');
  if (isLoggedIn && loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // 登录已过期
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_login_time');
      return <Navigate to="/login" replace />;
    }
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;