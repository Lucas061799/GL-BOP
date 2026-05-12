import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/heroimg.png'
import jungleImg from '../assets/jungle.png'

const CARRIERS = ['Coterie', 'Hiscox', 'CNA', 'Great American']

export default function PageZero({ onStart }) {
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
              <div className="text-center mt-6">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="h-px flex-1 max-w-[140px] bg-gray-200" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-300 whitespace-nowrap">Trusted Carrier Partners</p>
                  <span className="h-px flex-1 max-w-[140px] bg-gray-200" />
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {CARRIERS.map(c => (
                    <span
                      key={c}
                      className="text-[13px] font-bold px-4 py-1.5 rounded-full inline-block"
                      style={{ border: '1px solid rgba(92,46,212,0.25)', background: '#ffffff' }}
                    >
                      <span className="text-gradient">{c}</span>
                    </span>
                  ))}
                </div>
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
                style={{ objectFit: 'cover', transform: 'scale(1.45)', transformOrigin: 'center' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
