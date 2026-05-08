import { NavLink } from 'react-router-dom'
import { TennisPlayerSVG } from './TennisDeco'

const links = [
  { to: '/', label: 'Início' },
  { to: '/matches', label: 'Partidas' },
  { to: '/rankings', label: 'Ranking' },
  { to: '/h2h', label: 'H2H' },
  { to: '/players', label: 'Jogadores' },
]

export default function Navbar() {
  return (
    <nav className="bg-[#06090f] sticky top-0 z-50 clay-grain">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-20">

        {/* Logo ATP TOUR */}
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          {/* Silhueta do tenista */}
          <TennisPlayerSVG height={52} className="opacity-90" />

          {/* Texto ATP TOUR */}
          <div className="leading-none select-none">
            <div
              className="text-white font-black leading-none tracking-tighter"
              style={{ fontSize: '48px', lineHeight: 1 }}
            >
              ATP
            </div>
            <div
              className="font-black leading-none tracking-widest uppercase"
              style={{
                fontSize: '11px',
                letterSpacing: '6px',
                color: '#C2703A',
                marginTop: '3px',
              }}
            >
              TOUR
            </div>
          </div>
        </NavLink>

        {/* Links de navegação */}
        <div className="flex gap-0.5 shrink-0">
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

      {/* Linha de saibro na base do navbar — como a linha de fundo de uma quadra */}
      <div
        className="h-[2px] clay-grain-strong"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #8B4513 10%, #C2703A 40%, #D4845A 50%, #C2703A 60%, #8B4513 90%, transparent 100%)',
        }}
      />
    </nav>
  )
}
