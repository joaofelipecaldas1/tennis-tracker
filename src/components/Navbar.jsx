import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/matches', label: 'Partidas' },
  { to: '/rankings', label: 'Ranking' },
  { to: '/h2h', label: 'H2H' },
  { to: '/players', label: 'Jogadores' },
]

function ATPLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="13" fill="#1d4ed8"/>
        <circle cx="14" cy="14" r="13" stroke="#3b82f6" strokeWidth="0.5"/>
        <path d="M2.5 14 Q8 7.5 14 14 Q20 20.5 25.5 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M2.5 14 Q8 20.5 14 14 Q20 7.5 25.5 14" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" opacity="0.35"/>
      </svg>
      <div className="leading-none select-none">
        <div className="text-white font-black text-base tracking-tight leading-none">ATP</div>
        <div className="text-blue-400 font-semibold leading-none mt-[3px]" style={{ fontSize: '8px', letterSpacing: '4px' }}>TOUR</div>
      </div>
    </div>
  )
}

export default function Navbar() {
  return (
    <nav className="bg-[#06090f] border-b border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <NavLink to="/">
          <ATPLogo />
        </NavLink>
        <div className="flex gap-0.5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
    </nav>
  )
}
