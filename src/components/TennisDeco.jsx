/* Componentes decorativos de tênis — usados em todo o site */

/* Silhueta de tenista em posição de saque */
export function TennisPlayerSVG({ height = 56, className = '' }) {
  const width = Math.round(height * 0.95)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 72"
      fill="white"
      aria-hidden="true"
      className={className}
    >
      {/* Bola sendo lançada */}
      <circle cx="6" cy="10" r="3.5" opacity="0.7" />
      {/* Cabeça */}
      <circle cx="33" cy="14" r="6" />
      {/* Corpo (arco do saque, levemente inclinado) */}
      <path d="M29 20 C27 28 24 36 26 47 L34 47 C34 36 37 28 37 20 Z" />
      {/* Braço direito levantado com raquete */}
      <path d="M36 25 L50 11 L52 13 L38 27 Z" />
      {/* Oval da raquete */}
      <ellipse cx="53" cy="9" rx="5.5" ry="7.5" fill="none" stroke="white" strokeWidth="2.5" />
      {/* Cordas horizontais */}
      <line x1="47.5" y1="9" x2="58.5" y2="9" stroke="white" strokeWidth="0.9" opacity="0.45" />
      {/* Cordas verticais */}
      <line x1="53" y1="1.5" x2="53" y2="16.5" stroke="white" strokeWidth="0.9" opacity="0.45" />
      {/* Braço esquerdo (lançando a bola) */}
      <path d="M29 24 L12 13 L10 15 L27 26 Z" />
      {/* Perna direita (à frente) */}
      <path d="M32 47 L37 67 L33 69 L28 47 Z" />
      {/* Perna esquerda (atrás) */}
      <path d="M28 47 L21 65 L25 68 L32 47 Z" />
    </svg>
  )
}

/* Linha de baseline de quadra — separador de seções */
export function CourtBaseline({ className = '' }) {
  return (
    <div className={`relative h-2 flex items-center ${className}`} aria-hidden="true">
      {/* Linha principal */}
      <div className="absolute inset-x-0 h-px bg-[#C2703A]/20" />
      {/* Marca central (center service mark) */}
      <div className="absolute left-1/2 -translate-x-1/2 w-px h-2 bg-[#C2703A]/40" />
      {/* Marca lateral esquerda */}
      <div className="absolute left-0 w-px h-2 bg-[#C2703A]/50" />
      {/* Marca lateral direita */}
      <div className="absolute right-0 w-px h-2 bg-[#C2703A]/50" />
    </div>
  )
}

/* Ícone de raquete */
export function RacketIcon({ size = 14, className = '' }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.5)}
      viewBox="0 0 14 21"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className={className}
    >
      <ellipse cx="7" cy="7" rx="5.5" ry="6.5" strokeWidth="1.5" />
      <line x1="1.5" y1="7" x2="12.5" y2="7" strokeWidth="0.8" opacity="0.6" />
      <line x1="7" y1="0.5" x2="7" y2="13.5" strokeWidth="0.8" opacity="0.6" />
      <line x1="7" y1="13.5" x2="7" y2="20.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* Ícone de bola de tênis */
export function BallIcon({ size = 12, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 5 Q8 8 13.5 5" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M2.5 11 Q8 8 13.5 11" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}
