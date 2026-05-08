import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/matches', label: 'Partidas' },
  { to: '/rankings', label: 'Ranking' },
  { to: '/h2h', label: 'H2H' },
  { to: '/players', label: 'Jogadores' },
]

const ATP_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/ATP_Tour_logo.svg/320px-ATP_Tour_logo.svg.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <nav className="bg-[#06090f] sticky top-0 z-50">
        {/* Barra principal */}
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">

          {/* Logo oficial ATP Tour */}
          <NavLink to="/" onClick={close} className="shrink-0">
            <img
              src={ATP_LOGO}
              alt="ATP Tour"
              loading="eager"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </NavLink>

          {/* Nav desktop — oculto no mobile */}
          <div className="hidden sm:flex gap-0.5">
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

          {/* Botão hambúrguer — só no mobile */}
          <button
            onClick={() => setOpen(o => !o)}
            className="sm:hidden w-11 h-11 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label={open ? 'Fechar menu' : 'Menu'}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="16" y2="16" />
                <line x1="16" y1="2" x2="2" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="0" y1="1" x2="20" y2="1" />
                <line x1="0" y1="7.5" x2="20" y2="7.5" />
                <line x1="0" y1="14" x2="20" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* Faixa de saibro */}
        <div
          className="h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #8B4513 10%, #C2703A 40%, #D4845A 50%, #C2703A 60%, #8B4513 90%, transparent 100%)',
          }}
        />

        {/* Dropdown mobile */}
        {open && (
          <div className="sm:hidden bg-[#06090f] border-b border-slate-800/60">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={close}
                className={({ isActive }) =>
                  `block px-5 py-4 text-base font-semibold border-b border-slate-800/30 last:border-0 transition-colors ${
                    isActive
                      ? 'text-white bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Overlay — fecha o menu ao clicar fora */}
      {open && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  )
}
