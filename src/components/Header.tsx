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
          Sistema Operacional
        </div>
      </div>

      <div className="header-user">
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
        <div className="header-avatar">{initials}</div>
      </div>
    </header>
  )
}
