import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import norbieBodyImg from '../assets/norbie-body.png'
import jungleImg from '../assets/jungle.png'

const CARRIERS = ['Coterie', 'Hiscox', 'CNA', 'Great American']

export default function PageZero({ onStart }) {
  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col" style={{ overflow: 'hidden', height: '100vh' }}>

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide font-semibold">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — illustration (desktop only) */}
        <div className="hidden md:flex relative overflow-hidden shrink-0 items-end justify-center"
          style={{ width: '50%', background: 'white', borderRight: '1px solid #F3F4F6' }}>
          {/* Faded jungle bg */}
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.18 }} />
          {/* Norbie body */}
          <img
            src={norbieBodyImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{ height: '82%', maxHeight: '520px', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }}
          />
        </div>

        {/* Right — form */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center relative"
          style={{ background: 'white' }}>

          {/* Mobile: faint jungle bg */}
          <img
            src={jungleImg} alt=""
            className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.05 }}
          />

          <div className="relative z-10 w-full max-w-[480px] px-8 py-12">

            {/* Heading */}
            <div className="mb-10">
              <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-gradient mb-3">
                Business Owners Policy
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4" style={{ fontWeight: 800 }}>
                Get Multiple Quotes.<br />
                <span className="text-gradient">One Easy Application.</span>
              </h1>
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                Compare BOP quotes from top carriers in minutes, not hours.
                One application. Real-time pricing. Bind online.
              </p>
            </div>

            {/* CTA button */}
            <button
              onClick={() => onStart({})}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-px mb-10"
              style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }}
            >
              Start New Application
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Carriers */}
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-300 mb-3">Trusted Carrier Partners</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {CARRIERS.map(c => (
                  <span
                    key={c}
                    className="text-[13px] font-bold px-4 py-1.5 rounded-full text-gradient"
                    style={{ border: '1px solid rgba(92,46,212,0.12)', background: 'rgba(92,46,212,0.04)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
