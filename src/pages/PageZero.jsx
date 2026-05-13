import { useState } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import heroImg from '../assets/heroimg.png'
import jungleImg from '../assets/jungle.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const CARRIERS = ['Coterie', 'Hiscox', 'CNA', 'Great American']

// External GL portal — opens in a new tab if the user picks GL.
// Swap this URL when the real GL application is wired up.
const GL_APP_URL = 'https://www.btisinc.com/general-liability'

function CarrierChip({ name }) {
  return (
    <span
      className="text-[11px] font-bold px-3 py-1 rounded-full inline-block"
      style={{ border: '1px solid rgba(92,46,212,0.22)', background: 'white' }}
    >
      <span
        style={{
          background: BRAND_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {name}
      </span>
    </span>
  )
}

function CoverageTypeModal({ open, onClose, onPickBop, onPickGl }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,18,40,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh', background: 'white', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">What type of coverage?</h2>
          <p className="text-sm text-gray-500 mt-1">Choose the policy that fits your client's needs.</p>
        </div>

        {/* Two cards */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BOP card */}
          <button
            type="button"
            onClick={onPickBop}
            className="rounded-2xl p-5 text-left transition hover:-translate-y-px hover:shadow-md"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,58,237,0.10)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Business Owners Policy</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              Property + Liability bundled. Covers your building, equipment, and general liability in one policy.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Coterie', 'Hiscox', 'CNA', 'Great American'].map(c => <CarrierChip key={c} name={c} />)}
            </div>
          </button>

          {/* GL card */}
          <button
            type="button"
            onClick={onPickGl}
            className="rounded-2xl p-5 text-left transition hover:-translate-y-px hover:shadow-md"
            style={{ background: 'white', border: '1.5px solid #E5E7EB' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(115,201,183,0.18)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">General Liability</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
              Liability only. Covers third-party bodily injury and property damage claims against your business.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Coterie', 'Hiscox'].map(c => <CarrierChip key={c} name={c} />)}
            </div>
          </button>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition border-t"
          style={{ borderColor: '#F3F4F6' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function PageZero({ onStart }) {
  const [coverageModalOpen, setCoverageModalOpen] = useState(false)

  const pickBop = () => {
    setCoverageModalOpen(false)
    onStart({})
  }
  const pickGl = () => {
    setCoverageModalOpen(false)
    window.open(GL_APP_URL, '_blank', 'noopener,noreferrer')
  }

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
                onClick={() => setCoverageModalOpen(true)}
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
                style={{ objectFit: 'cover', transform: 'translate(-20px, 30px) scale(1.45)', transformOrigin: 'center' }}
              />
            </div>
          </div>
        </div>

      </div>

      <CoverageTypeModal
        open={coverageModalOpen}
        onClose={() => setCoverageModalOpen(false)}
        onPickBop={pickBop}
        onPickGl={pickGl}
      />
    </div>
  )
}
