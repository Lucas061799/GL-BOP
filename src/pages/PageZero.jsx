import { useState, useRef, useEffect } from 'react'
import norbielinkLogo from '../assets/norbielink-logo.png'
import btisLogo from '../assets/btislogo.png'
import bananaImg from '../assets/banana.png'
import jungleImg from '../assets/jungle.png'
import norbieCircleImg from '../assets/norbie-circle-00.png'

const ALL_STATES = [
  'AL - Alabama','AK - Alaska','AZ - Arizona','AR - Arkansas','CA - California',
  'CO - Colorado','CT - Connecticut','DE - Delaware','FL - Florida','GA - Georgia',
  'HI - Hawaii','ID - Idaho','IL - Illinois','IN - Indiana','IA - Iowa',
  'KS - Kansas','KY - Kentucky','LA - Louisiana','ME - Maine','MD - Maryland',
  'MA - Massachusetts','MI - Michigan','MN - Minnesota','MS - Mississippi','MO - Missouri',
  'MT - Montana','NE - Nebraska','NV - Nevada','NH - New Hampshire','NJ - New Jersey',
  'NM - New Mexico','NY - New York','NC - North Carolina','ND - North Dakota','OH - Ohio',
  'OK - Oklahoma','OR - Oregon','PA - Pennsylvania','RI - Rhode Island','SC - South Carolina',
  'SD - South Dakota','TN - Tennessee','TX - Texas','UT - Utah','VT - Vermont',
  'VA - Virginia','WA - Washington','WV - West Virginia','WI - Wisconsin','WY - Wyoming',
]

const APPROVED_STATES = ['AZ - Arizona', 'CA - California', 'CO - Colorado', 'FL - Florida', 'GA - Georgia', 'PA - Pennsylvania', 'TX - Texas']

const APPROVED_CATEGORIES = [
  'Contractors',
  'Food Trucks',
  'Service Vehicles (locksmiths, dry cleaners, pest control, etc.)',
  'Manufacturing, Wholesale, or Retail (without filings)',
  'Restaurants (No Delivery)',
  'Farming',
]

// Custom dropdown — no native <select>
function Dropdown({ value, onChange, options, placeholder, searchable = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleSelect = (opt) => { onChange(opt); setOpen(false); setQuery('') }

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-base text-left"
        style={{
          background: 'white',
          borderColor: open ? '#A614C3' : '#E5E7EB',
          boxShadow: open ? '0 0 0 3px rgba(166,20,195,0.12)' : 'none',
          color: value ? '#111827' : '#9CA3AF',
        }}
      >
        <span className="truncate pr-2">{value || placeholder}</span>
        <svg
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: open ? '#A614C3' : '#9CA3AF' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl overflow-hidden"
          style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
          }}
        >
          {/* Options list */}
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {options.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No results</p>
              : options.map(opt => {
                  const selected = opt === value
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between gap-2"
                      style={{
                        background: selected ? 'linear-gradient(88.09deg, rgba(92,46,212,0.07) 0%, rgba(166,20,195,0.07) 100%)' : 'transparent',
                        color: selected ? '#A614C3' : '#374151',
                        fontWeight: selected ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#F9FAFB' }}
                      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span>{opt}</span>
                      {selected && (
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" stroke="url(#ddCheckG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="ddCheckG" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </button>
                  )
                })
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default function PageZero({ onStart }) {
  const [state, setState] = useState('')
  const [riskCategory, setRiskCategory] = useState('')
  const [declined, setDeclined] = useState(false)

  const canCheck = state && riskCategory

  const handleCheck = () => {
    if (!canCheck) return
    const approved = APPROVED_STATES.includes(state) && APPROVED_CATEGORIES.includes(riskCategory)
    if (approved) {
      onStart({ state, riskCategory })
    } else {
      setDeclined(true)
    }
  }

  const handleReset = () => {
    setState('')
    setRiskCategory('')
    setDeclined(false)
  }

  return (
    <div className="min-h-screen bg-white font-montserrat flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-100 px-5 md:px-8 shrink-0" style={{ height: '56px' }}>
        <img src={norbielinkLogo} alt="NorbieLink" className="h-7 md:h-8" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-[10px] md:text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={btisLogo} alt="btis" className="h-6 md:h-7" />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">

        {/* Left — form panel (full width on mobile, 50% on desktop) */}
        <div className="flex-1 md:w-1/2 md:flex-none overflow-y-auto relative"
          style={{ borderRight: '1px solid #F3F4F6' }}>

          {/* Mobile: subtle jungle bg behind form */}
          <img
            src={jungleImg} alt=""
            className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.06 }}
          />

          <div className="relative z-10 min-h-full flex flex-col justify-center items-center py-10 px-6 md:px-[10%]">
            <div className="w-full max-w-xl">

              {!declined ? (
                <>
                  {/* Title */}
                  <div className="mb-8 md:mb-10">
                    <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-gradient mb-2 md:mb-3">
                      Commercial Auto Insurance
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-2 md:mb-3">
                      Get Multiple Quotes.<br />
                      <span className="text-gradient">One Easy Application.</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                      First, let's start with the basics...
                    </p>
                  </div>

                  <div className="space-y-4 md:space-y-5">
                    {/* State dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-2">Location of Vehicle</label>
                      <Dropdown
                        value={state}
                        onChange={v => { setState(v); setDeclined(false) }}
                        options={ALL_STATES}
                        placeholder="Select which state the vehicle is located."
                        searchable
                      />
                    </div>

                    {/* Risk category dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-2">Acceptable Risk Categories</label>
                      <Dropdown
                        value={riskCategory}
                        onChange={v => { setRiskCategory(v); setDeclined(false) }}
                        options={APPROVED_CATEGORIES}
                        placeholder="Select from our accepted categories."
                      />
                    </div>

                    {/* Check Appetite button */}
                    <button
                      onClick={handleCheck}
                      disabled={!canCheck}
                      className="w-full py-4 rounded-xl text-base font-bold text-white transition-all"
                      style={canCheck
                        ? { background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }
                        : { background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }
                      }
                    >
                      Check Appetite
                    </button>
                  </div>

                </>
              ) : (
                /* Decline message */
                <div className="text-center py-6">
                  {/* 4 🍌 4 */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-black text-[#FCDF50] select-none" style={{ fontSize: '5rem', lineHeight: 1 }}>4</span>
                    <img src={bananaImg} alt="banana" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
                    <span className="font-black text-[#FCDF50] select-none" style={{ fontSize: '5rem', lineHeight: 1 }}>4</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                    Well banana...
                  </h2>
                  <p className="text-base text-gray-500 leading-relaxed mb-1">
                    We don't have an appetite for that one.
                  </p>
                  <p className="text-sm text-gray-400 mb-7">
                    {!APPROVED_STATES.includes(state)
                      ? `We're not currently writing in ${state}.`
                      : `That risk category isn't in our current appetite.`
                    } Try a different selection.
                  </p>
                  <button
                    onClick={handleReset}
                    className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 20px rgba(92,46,212,0.3)' }}
                  >
                    Try Again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right — illustration panel (desktop only) */}
        <div className="hidden md:flex relative overflow-hidden shrink-0 items-center justify-center"
          style={{ width: '50%', background: 'white' }}>
          {/* Faded jungle bg */}
          <img src={jungleImg} alt="" className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style={{ opacity: 0.25 }} />
          {/* Norbie circle image */}
          <img
            src={norbieCircleImg}
            alt="Norbie"
            className="relative z-10 select-none pointer-events-none"
            style={{ width: '500px', height: '500px', objectFit: 'contain' }}
          />
        </div>

      </div>
    </div>
  )
}
