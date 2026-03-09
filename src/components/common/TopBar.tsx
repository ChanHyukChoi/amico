import { useTranslation } from 'react-i18next'
import { logout } from '@/api/auth'

export function TopBar() {
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="h-14 shrink-0 border-b bg-white px-4 flex items-center justify-between">
      <span className="font-semibold text-gray-900">HID Amico</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100"
      >
        {t('layout.logout')}
      </button>
    </header>
  )
}
