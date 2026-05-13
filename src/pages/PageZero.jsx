import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/heroimg.png'
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
  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: 'white', border: '1.5px solid #E5E7EB' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent.bg }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{tagline}</p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-5">
        {bullets.map(b => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-gray-600 leading-snug">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClick}
        className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
        style={{ background: BRAND_GRADIENT, boxShadow: '0 4px 14px rgba(92,46,212,0.22)' }}
      >
        {ctaLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <ProductCard
                  title="Business Owners Policy"
                  tagline="Property + Liability bundled"
                  bullets={BOP_INCLUDES}
                  ctaLabel="Start BOP Quote"
                  onClick={startBop}
                  accent={{ bg: 'rgba(124,58,237,0.10)', stroke: '#5C2ED4' }}
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )}
                />
                <ProductCard
                  title="General Liability"
                  tagline="Liability protection, standalone"
                  bullets={GL_INCLUDES}
                  ctaLabel="Start GL Quote"
                  onClick={startGl}
                  accent={{ bg: 'rgba(115,201,183,0.18)', stroke: '#10B981' }}
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          <div
            className="relative z-10 select-none pointer-events-none"
            style={{
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              padding: '6px',
              background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
              boxShadow: '0 10px 40px rgba(92,46,212,0.18)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'white',
              }}
            >
              <img
                src={heroImg}
                alt="Norbie"
                className="w-full h-full select-none pointer-events-none"
                style={{ objectFit: 'cover', transform: 'translate(-20px, 30px) scale(1.45)', transformOrigin: 'center' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
