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

// Numbered steps shown while quotes haven't come back yet — same
// visual pattern as BopSubmission's 'What's Next' block so the
// form-filling phase and the bind phase feel like one product.
const NEXT_STEPS = [
  { n: 1, t: 'Tell us about the business', d: 'Add revenue, payroll, and employee count so carriers can rate the risk.' },
  { n: 2, t: 'Compare live quotes',         d: "We'll fetch real-time prices across every carrier on the list." },
  { n: 3, t: 'Bind in minutes',              d: 'Pick the carrier that fits, review the terms, and pay to issue the policy.' },
]

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

  // Show the carrier *list* (logos + names, no prices) as soon as a class
  // code is picked. Prices only appear once we have at least one financial
  // input to base the estimate on (revenue, payroll, or employee count).
  const readyToQuote = !!formData.smartStart?.classId
  const biz = formData.business || {}
  const hasAnyFinancial = !!(
    Number(String(biz.annualRevenue     || '').replace(/[^0-9]/g, '')) ||
    Number(String(biz.annualPayroll     || '').replace(/[^0-9]/g, '')) ||
    Number(String(biz.numberOfEmployees || '').replace(/[^0-9]/g, ''))
  )
  const showPrices = readyToQuote && hasAnyFinancial

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
            disabled={!showPrices || refreshing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition mb-3 disabled:cursor-not-allowed"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFB',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
              color: showPrices ? (isDark ? '#D8B4FE' : '#374151') : '#9CA3AF',
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
          ) : showPrices ? (() => {
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
          })() : (
            /* No prices yet — show a small caption above the carrier list */
            <p className="text-[11px] text-gray-400 mb-3 leading-snug">
              Add revenue, payroll, or employees to see prices.
            </p>
          )}

          {/* Carrier list — when prices are showing this is just the
              non-best carriers (cheapest is the hero card above);
              otherwise it's the full list with a shimmer where the
              price will appear, and rows are non-interactive. */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} isDark={isDark} />)
              : (showPrices ? quotes.slice(1) : quotes).map(q => {
                  const isSelected = showPrices && selectedCarrier === q.id
                  const Wrapper = showPrices ? 'button' : 'div'
                  return (
                    <Wrapper
                      type={showPrices ? 'button' : undefined}
                      key={q.id}
                      onClick={showPrices ? () => selectCarrier(q.id) : undefined}
                      className={`w-full rounded-xl px-3 py-3 flex items-center gap-3 transition text-left ${showPrices ? 'cursor-pointer' : 'cursor-default'}`}
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
                      {showPrices ? (
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-gray-900 leading-tight">{money(q.premium)}</div>
                          <div className="text-[9px] text-gray-400">per year</div>
                        </div>
                      ) : (
                        /* Quotes are still loading — small purple spinner */
                        <div className="shrink-0 flex items-center justify-center" title="Fetching quote…">
                          <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="#5C2ED4" strokeWidth="2.4" strokeLinecap="round"
                            className="animate-spin"
                            style={{ opacity: 0.7 }}
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        </div>
                      )}
                    </Wrapper>
                  )
                })
            }
          </div>

          {!readyToQuote && (
            <p className="text-[10px] text-gray-400 text-left mt-3 leading-relaxed">
              Pick a class code to see live quotes.
            </p>
          )}


          {/* Download Quote Proposal — enabled once a carrier is selected */}
          {showPrices && !showSkeleton && (
            <button
              type="button"
              disabled={!selectedCarrier}
              onClick={() => { /* hook up real proposal download here */ }}
              className="w-full inline-flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed"
              style={selectedCarrier
                ? {
                    background: BRAND_GRADIENT,
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(92,46,212,0.22)',
                  }
                : {
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFB',
                    color: isDark ? '#6B7280' : '#9CA3AF',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}`,
                  }
              }
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <polyline points="9 14 12 17 15 14"/>
              </svg>
              Download Quote Proposal
            </button>
          )}
          {readyToQuote && !showSkeleton && !selectedCarrier && (
            <p className="text-[10px] text-gray-400 text-left mt-2 leading-relaxed">
              Select a carrier above to download the quote proposal.
            </p>
          )}

          {/* What happens next — only while quotes haven't landed.
              Same chrome as BopSubmission's post-bind 'What's Next'. */}
          {readyToQuote && !showPrices && (
            <div className="mt-6">
              <h3 className="text-sm font-bold mb-4" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                What happens next
              </h3>
              <div className="space-y-5">
                {NEXT_STEPS.map(step => (
                  <div key={step.n} className="flex gap-3">
                    <span
                      className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.25) 0%, rgba(166,20,195,0.25) 100%)' }}
                    >
                      <span
                        style={{
                          background: BRAND_GRADIENT,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {step.n}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{step.t}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed text-gray-400">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </aside>
  )
}
