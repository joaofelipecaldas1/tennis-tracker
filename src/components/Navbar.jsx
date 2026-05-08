import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/matches', label: 'Partidas' },
  { to: '/rankings', label: 'Ranking' },
  { to: '/players', label: 'Jogadores' },
]

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="text-green-400 font-bold text-lg tracking-wide">🎾 Tennis</span>
        <div className="flex gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-500 text-gray-900'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
