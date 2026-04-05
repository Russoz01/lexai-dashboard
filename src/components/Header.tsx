'use client'

import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar: () => void
}

export default function Header({ userName = 'Usuário', userRole = 'LexAI', onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <i className="bi bi-list" />
        </button>
        <div className="header-status">
          <span className="dot" />
          Online
        </div>
      </div>

      <div className="header-user">
        {/* Notificações */}
        <button className="notif-bell" title="Notificações">
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>

        {/* Theme toggle */}
        <button
          className="header-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`} />
        </button>

        <div className="header-user-info">
          <div className="name">{userName}</div>
          <div className="role">{userRole}</div>
        </div>
        <div className="header-avatar" style={{ transition: 'border-color 0.2s ease' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#F5A623')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>
          {initials}
        </div>
      </div>
    </header>
  )
}
