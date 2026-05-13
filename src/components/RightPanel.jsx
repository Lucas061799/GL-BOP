import { useState, useEffect, useMemo } from 'react'
import logoCoterie       from '../assets/carrier-coterie.png'
import logoHiscox        from '../assets/carrier-hiscox.png'
import logoCNA           from '../assets/carrier-cna.png'
import logoGreatAmerican from '../assets/carrier-greatamerican.png'
import logoUSLI          from '../assets/carrier-usli.png'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// BOP completion logic — mirrors Sidebar.jsx so the % always agrees
function getSectionCompletion(formData) {
  const results = {}
  results[1] = !!formData.smartStart?.classId
  const b = formData.business || {}
  results[2] = !!(b.name && b.entityType && b.effectiveDate && b.annualRevenue && b.annualPayroll && b.numberOfEmployees && b.phone && b.email)
  const l = formData.location || {}
  results[3] = !!(l.address && l.city && l.state && l.zip)
  const hasCoverageInput = !!formData.coverage && Object.keys(formData.coverage).length > 0
  const hasUwInput = !!formData.underwriting && Object.keys(formData.underwriting).some(k => formData.underwriting[k] !== undefined && formData.underwriting[k] !== null && formData.underwriting[k] !== '')
  results[4] = hasCoverageInput || hasUwInput
  const uw = formData.underwriting || {}
  const requiredUw = ['prior_losses', 'pending_claims', 'declined_coverage', 'criminal_bankruptcy', 'manufactures_goods', 'subcontracts', 'tangible_goods']
  results[5] = requiredUw.every(k => uw[k] !== undefined && uw[k] !== null && uw[k] !== '')
  results[6] = !!formData.bind?.selectedCarrier
  results[7] = !!formData.bind?.bound
  return results
}

const CARRIERS = [
  { id: 'USLI',           name: 'USLI',            multiplier: 0.91, logo: logoUSLI },
  { id: 'Coterie',        name: 'Coterie',         multiplier: 1.00, logo: logoCoterie },
  { id: 'Hiscox',         name: 'Hiscox',          multiplier: 1.12, logo: logoHiscox },
  { id: 'CNA',            name: 'CNA',             multiplier: 1.34, logo: logoCNA },
  { id: 'Great American', name: 'Great American',  multiplier: 1.62, logo: logoGreatAmerican },
]

// Rough premium estimate from the business data the user has entered.
// Same formula across carriers, then we apply a per-carrier multiplier.
function estimatePremium(formData) {
  const b = formData.business || {}
  const revenue   = Number(String(b.annualRevenue   || '').replace(/[^0-9]/g, '')) || 0
  const payroll   = Number(String(b.annualPayroll   || '').replace(/[^0-9]/g, '')) || 0
  const employees = Number(String(b.numberOfEmployees || '').replace(/[^0-9]/g, '')) || 0
  const base = 800 + (revenue / 100_000) * 55 + (payroll / 100_000) * 110 + employees * 28
  return Math.max(base, 600)
}

const money = (n) => '$' + Math.round(n).toLocaleString()

// Carrier logo chip — square white tile holding the partner logo
function CarrierMark({ name, logo, size = 'sm' }) {
  const dim = size === 'lg' ? 64 : 40
  return (
    <div
      className="rounded-xl flex items-center justify-center shrink-0"
      style={{
        width: dim,
        height: dim,
        background: 'white',
        border: '1px solid #E5E7EB',
        padding: size === 'lg' ? 8 : 6,
      }}
    >
      <img
        src={logo}
        alt={name}
        className="max-w-full max-h-full select-none pointer-events-none"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

function SkeletonRow({ isDark = false }) {
  const skelClass = isDark ? 'skel-dark' : 'skel'
  return (
    <div
      className="rounded-xl px-3 py-3 flex items-center gap-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
      }}
    >
      <div className={`${skelClass} w-9 h-9 rounded-xl shrink-0`} />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className={`${skelClass} h-3 rounded w-14`} />
        <div className={`${skelClass} h-3 rounded w-12`} />
      </div>
      <style>{`
        .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        .skel-dark { background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}

export default function RightPanel({ formData = {}, updateFormData, isDark = false }) {
  const selectedCarrier = formData.bind?.selectedCarrier
  const selectCarrier = (id) => {
    if (!updateFormData) return
    // Toggle off if clicking the already-selected card
    updateFormData('bind', { selectedCarrier: selectedCarrier === id ? null : id })
  }

  const [refreshing, setRefreshing] = useState(false)

  const completion = useMemo(() => getSectionCompletion(formData), [formData])
  const completedCount = Object.values(completion).filter(Boolean).length
  const progressPct = Math.round((completedCount / 7) * 100)

  // Show estimates as soon as the user has picked a class code. The premium
  // formula falls back to a base value when financials are empty, then
  // refines live as revenue / payroll / employees get filled in.
  const readyToQuote = !!formData.smartStart?.classId

  // Pre-quote shimmer: re-trigger briefly after the readiness threshold flips, or on Refresh click.
  const [primingQuotes, setPrimingQuotes] = useState(false)
  useEffect(() => {
    if (readyToQuote) {
      setPrimingQuotes(true)
      const t = setTimeout(() => setPrimingQuotes(false), 1100)
      return () => clearTimeout(t)
    }
  }, [readyToQuote])

  const baseEstimate = useMemo(() => estimatePremium(formData), [formData])
  // Sort cheapest-first so the highlighted card is the best price
  const quotes = useMemo(() => {
    return CARRIERS.map(c => ({ ...c, premium: baseEstimate * c.multiplier }))
      .sort((a, b) => a.premium - b.premium)
  }, [baseEstimate])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1100)
  }

  const showSkeleton = !readyToQuote || primingQuotes || refreshing

  return (
    <aside
      className="w-80 2xl:w-96 flex flex-col h-full sticky top-0 shrink-0"
      style={{
        background: isDark ? '#191D35' : 'white',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
      }}
    >
      <div className="p-5 flex-1 overflow-y-auto sidebar-nav">

        {/* Title */}
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>Quote in Progress</h2>

        {/* Auto-saved + % row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="autoGradRP" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isDark ? '#A78BFA' : '#5C2ED4'}/>
                  <stop offset="100%" stopColor={isDark ? '#E879F9' : '#A614C3'}/>
                </linearGradient>
              </defs>
              <path d="M12 16V9m0 0l-3 3m3-3l3 3" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 18A4.5 4.5 0 016 9.1V9a6 6 0 0111.9-.9A4.5 4.5 0 0118 18H6.5z" stroke="url(#autoGradRP)" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs font-medium text-gradient">All progress auto-saved</span>
          </div>
          <span className="text-xs font-bold text-gradient">{progressPct}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: BRAND_GRADIENT }}
          />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* ============================ Live Quotes ============================ */}
        <div className="mb-5">
          {/* Refresh My Quote */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!readyToQuote || refreshing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition mb-3 disabled:cursor-not-allowed"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFB',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
              color: readyToQuote ? (isDark ? '#D8B4FE' : '#374151') : '#9CA3AF',
            }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh My Quote'}
          </button>

          {/* Highlighted top carrier */}
          {showSkeleton ? (
            <div
              className="rounded-2xl px-5 py-6 mb-3 flex flex-col items-center gap-3"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'}`,
              }}
            >
              <div className={`${isDark ? 'skel-dark' : 'skel'} w-14 h-14 rounded-xl`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-8 w-32 rounded`} />
              <div className={`${isDark ? 'skel-dark' : 'skel'} h-3 w-20 rounded`} />
            </div>
          ) : (() => {
            const top = quotes[0]
            const isSelected = selectedCarrier === top.id
            return (
              <button
                type="button"
                onClick={() => selectCarrier(top.id)}
                className="w-full rounded-2xl px-5 py-5 mb-3 flex flex-col items-center text-center relative overflow-hidden transition cursor-pointer hover:-translate-y-px"
                style={{
                  background: 'white',
                  border: `1.5px solid ${isSelected ? '#5C2ED4' : '#7C3AED'}`,
                  boxShadow: isSelected
                    ? '0 6px 24px rgba(92,46,212,0.22)'
                    : '0 4px 20px rgba(92,46,212,0.10)',
                }}
              >
                <div
                  className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  BEST
                </div>
                {isSelected && (
                  <div
                    className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <CarrierMark name={top.name} logo={top.logo} size="lg" />
                <div className="mt-3">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {money(top.premium)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Annual Premium</p>
                <p
                  className="text-[10px] font-semibold mt-2"
                  style={{ color: isSelected ? '#5C2ED4' : '#9CA3AF' }}
                >
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </p>
              </button>
            )
          })()}

          {/* Remaining carriers */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
              : quotes.slice(1).map(q => {
                  const isSelected = selectedCarrier === q.id
                  return (
                    <button
                      type="button"
                      key={q.id}
                      onClick={() => selectCarrier(q.id)}
                      className="w-full rounded-xl px-3 py-3 flex items-center gap-3 transition cursor-pointer text-left"
                      style={{
                        background: isSelected ? 'rgba(124,58,237,0.06)' : 'white',
                        border: `1.5px solid ${isSelected ? '#7C3AED' : '#E5E7EB'}`,
                        boxShadow: isSelected ? '0 4px 14px rgba(92,46,212,0.10)' : 'none',
                      }}
                    >
                      <CarrierMark name={q.name} logo={q.logo} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-700 truncate">{q.name}</p>
                        {isSelected && (
                          <p
                            className="text-[9px] font-semibold mt-0.5"
                            style={{
                              background: BRAND_GRADIENT,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            ✓ Selected
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-gray-900 leading-tight">{money(q.premium)}</div>
                        <div className="text-[9px] text-gray-400">per year</div>
                      </div>
                    </button>
                  )
                })
            }
          </div>

          {!readyToQuote && (
            <p className="text-[10px] text-gray-400 text-left mt-3 leading-relaxed">
              Pick a class code to see live quotes.
            </p>
          )}
        </div>


      </div>
    </aside>
  )
}
