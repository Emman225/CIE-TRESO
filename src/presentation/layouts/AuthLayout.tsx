import React from 'react';
import { Outlet } from 'react-router-dom';
import loginBg from '@/assets/bg2.png';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Image */}
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Branded overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e65000]/60 via-black/50 to-[#22a84c]/30"></div>

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-[460px]">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
