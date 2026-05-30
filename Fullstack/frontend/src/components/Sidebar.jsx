import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  {
    label: 'Dashboard', 
    path: '/',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
  {
    label: 'Results',
    path: '/result',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  },
  {
    label: 'Settings',
    path: null,
    icon: <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>,
  },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
  return localStorage.getItem('sidebarCollapsed') === 'true'
})

const toggle = (val) => {
  setCollapsed(val)
  localStorage.setItem('sidebarCollapsed', String(val))
}

  return (
    <>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-52'} bg-gray-900 flex flex-col py-5 fixed h-full z-20 transition-all duration-300`}>

        {/* LOGO + TOGGLE */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-5'} pb-4 border-b border-white/10 mb-4`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              {/* Logo icon */}
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">CareerMatch</p>
                <p className="text-white/40 text-xs">v2.4.1</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}

          {/* Toggle button */}
          {!collapsed && (
            <button onClick={() => toggle(true)} className="text-white/30 hover:text-white transition p-1 rounded-md hover:bg-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand button */}
        {collapsed && (
          <button onClick={() => toggle(false)} className="mx-auto mb-3 text-white/30 hover:text-white transition p-1.5 rounded-md hover:bg-white/5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* NAV */}
        <nav className={`flex flex-col gap-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {NAV.map(({ label, path, icon }) => {
            const active = location.pathname === path
            return (
              <button key={label} onClick={() => path && navigate(path)}
                title={collapsed ? label : ''}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all
                  ${collapsed ? 'justify-center' : ''}
                  ${active ? 'bg-blue-600 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {icon}
                </svg>
                {!collapsed && label}
              </button>
            )
          })}
        </nav>

        {/* USER */}
        <div className={`mt-auto pt-3 border-t border-white/10 ${collapsed ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">U</div>
            {!collapsed && (
              <div>
                <p className="text-white text-sm font-medium">User</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer */}
      <div className={`${collapsed ? 'w-16' : 'w-52'} flex-shrink-0 transition-all duration-300 hidden md:block`} />
    </>
  )
}

export default Sidebar