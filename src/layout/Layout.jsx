import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LuTicket, LuGift, LuHistory, LuHeart } from 'react-icons/lu';

const Layout = () => {
  const navItems = [
    { path: '/', label: 'Coupons', icon: LuTicket },
    { path: '/wishes', label: 'Wish List', icon: LuGift },
    { path: '/history', label: 'Redeemed', icon: LuHistory },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#2B2D42] font-sans pb-24 md:pb-0 selection:bg-[#E07A5F]/20">

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#E07A5F]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#E9C46A]/15 rounded-full blur-3xl" />
      </div>


      <main className="relative z-10 max-w-md md:max-w-4xl mx-auto px-4 pt-6">
        <header className="flex justify-between items-center mb-6 px-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#E07A5F] font-semibold">Special Edition</span>
            <h1 className="text-2xl font-bold tracking-tight text-[#2B2D42]">Wish & Coupon Book</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-[#E07A5F]">
            <LuHeart className="w-5 h-5 fill-current" />
          </div>
        </header>

        <Outlet />
      </main>


      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg z-50 px-3 py-2">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="w-full">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1.5 transition-all duration-300 rounded-xl ${isActive
                      ? 'text-[#E07A5F] font-medium bg-white/80 shadow-xs'
                      : 'text-gray-400 hover:text-gray-600'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Layout;