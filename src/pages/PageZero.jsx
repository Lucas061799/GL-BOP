import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/norbie-heroimg.png'
import jungleImg from '../assets/jungle.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// What's included in each product. Edit these lists as the real content lands.
const BOP_INCLUDES = [
  'Property coverage — building, equipment, inventory',
  'General liability protection',
  'Business income / interruption',
  'Designed for bundled small-business needs',
]
const GL_INCLUDES = [
  'Third-party bodily injury',
  'Third-party property damage',
  'Personal & advertising injury',
  'Products & completed operations',
]

function ProductCard({ accent, icon, title, tagline, bullets, ctaLabel, onClick }) {
  // Use an outer box-shadow ring (instead of a CSS border) so the stripe child
  // can clip cleanly to the rounded corners without leaving a gray L at the top.
  const restingShadow = '0 0 0 1.5px #E5E7EB, 0 1px 2px rgba(0,0,0,0.02)'
  const hoverShadow   = '0 0 0 1.5px rgba(124,58,237,0.45), 0 12px 32px rgba(92,46,212,0.12)'
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col transition hover:-translate-y-0.5 group cursor-pointer"
      style={{ background: 'white', boxShadow: restingShadow }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = hoverShadow }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = restingShadow }}
    >
      <div className="px-5 pt-5 pb-5 flex flex-col flex-1">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3.5"
          style={{ background: accent.bg }}
        >
          {icon}
        </div>

        {/* Title + tagline */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{title}</h3>
        <p className="text-[12px] text-gray-500 leading-snug mb-4">{tagline}</p>

        {/* Divider */}
        <div className="border-t mb-4" style={{ borderColor: '#F3F4F6' }} />

        {/* Bullets */}
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">What's included</p>
        <ul className="space-y-2 mb-5 flex-1">
          {bullets.map(b => (
            <li key={b} className="flex items-start gap-2 text-[12.5px] text-gray-700 leading-snug">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: accent.bg }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={accent.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
        >
          {ctaLabel}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function PageZero({ onStart }) {
  // BOP button — manager said the real route will be the existing BOP UI
  // once we can merge the two together. For now, start the in-app flow.
  const startBop = () => onStart({ productType: 'bop' })
  // GL — starts the full application; class code is the first step inside.
  const startGl = () => onStart({ productType: 'gl' })

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">

        {/* Left — form panel */}
        <div className="flex-1 md:w-1/2 md:flex-none overflow-y-auto relative"
          style={{ borderRight: '1px solid #F3F4F6' }}>

          {/* Mobile: faint jungle bg */}
          <img
            src={jungleImg} alt=""
            className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.06 }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[10%]">
            <div className="w-full max-w-xl">

              {/* Heading */}
              <div className="mb-7">
                <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4" style={{ fontWeight: 800 }}>
                  Get Multiple Quotes.<br />
                  <span className="text-gradient">One Easy Application.</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Which coverage do you want to quote today? Pick a policy below to start the application.
                </p>
              </div>

              {/* Product choice — two cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <ProductCard
                  title="Business Owners Policy"
                  tagline="Property + Liability bundled into one easy policy."
                  bullets={BOP_INCLUDES}
                  ctaLabel="Start BOP Quote"
                  onClick={startBop}
                  accent={{
                    bg: 'rgba(124,58,237,0.10)',
                    stroke: '#5C2ED4',
                  }}
                  icon={(
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {/* Briefcase — universal 'business' icon */}
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  )}
                />
                <ProductCard
                  title="General Liability"
                  tagline="Standalone liability protection for your business."
                  bullets={GL_INCLUDES}
                  ctaLabel="Start GL Quote"
                  onClick={startGl}
                  accent={{
                    bg: 'rgba(166,20,195,0.10)',
                    stroke: '#A614C3',
                  }}
                  icon={(
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A614C3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  )}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right — illustration (desktop only) */}
        <div className="hidden md:flex relative overflow-hidden shrink-0 items-center justify-center"
          style={{ width: '50%', background: 'white' }}>
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          <img
            src={heroImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 40px rgba(92,46,212,0.18))',
            }}
          />
        </div>

      </div>
    </div>
  )
}
