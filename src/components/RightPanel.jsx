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
        .rp-dollar-pulse { display: inline-block; animation: rpDollarPulse 1.4s ease-in-out infinite; }
        @keyframes rpDollarPulse { 0%, 100% { opacity: 0.35 } 50% { opacity: 1 } }
      `}</style>
    </div>
  )
}

// Steps shown in the right rail while the user is moving through
// the quote flow (Compare → Package → Add-Ons → Bind & Pay).
const QUOTE_STEPS = [
  { id: 'compare',  n: 1, label: 'Compare Quotes' },
  { id: 'package',  n: 2, label: 'Choose Package' },
  { id: 'addons',   n: 3, label: 'Add-Ons' },
  { id: 'bind',     n: 4, label: 'Bind & Pay' },
]

export default function RightPanel({ formData = {}, updateFormData, isDark = false, inQuoteFlow = false, quoteStep = 'compare' }) {
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

        {/* ============================ Live Quotes (form pages) ============================ */}
        {!inQuoteFlow && (
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
                        /* Quotes are still loading — a gently pulsing
                           "$" placeholder where the price will land.
                           Same visual weight as the eventual price
                           number, so the row doesn't jump when the
                           value arrives. */
                        <div
                          className="shrink-0 flex items-baseline text-sm font-bold tabular-nums"
                          title="Calculating quote…"
                          aria-label="Calculating quote"
                        >
                          <span className="rp-dollar-pulse" style={{ color: '#5C2ED4' }}>$</span>
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
        </div>
        )}

        {/* ============================ Quote-flow summary ============================ */}
        {/* Compare → Package → Add-Ons → Bind. The right rail switches from
            the carrier list to a focused 'selected carrier' summary so the
            user can see their choice and the running total while they
            tune packages and add-ons on the main canvas. */}
        {inQuoteFlow && (() => {
          const carrierName     = formData.bind?.selectedCarrier
          const carrierLogo     = CARRIERS.find(c => c.name === carrierName)?.logo
          const carrierPremium  = Number(formData.bind?.carrierPremium || 0)
          const packageId       = formData.bind?.packageId
          // Only fold package/add-on premiums into the total once a
          // package is actually picked. Stale values from a previous
          // run shouldn't show before the user reaches that step.
          const packagePremium  = packageId ? Number(formData.bind?.packagePremium || 0) : 0
          const addonsPremium   = packageId ? Number(formData.bind?.addonsPremium  || 0) : 0
          const totalPremium    = carrierPremium + packagePremium + addonsPremium
          const PACKAGE_LABEL   = { base: 'Base', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }
          const packageLabel    = packageId ? PACKAGE_LABEL[packageId] : null

          // A step is "done" if the user has navigated past it in the
          // current flow. We deliberately don't infer this from data
          // (formData.bind.packageId etc) because that leaks state from
          // earlier runs and marks future steps as done while the user
          // is still on Compare.
          const currentIdx = Math.max(0, QUOTE_STEPS.findIndex(s => s.id === quoteStep))

          return (
            <div className="mb-5">
              {/* Selected carrier card */}
              {carrierName ? (
                <div
                  className="rounded-2xl px-5 py-5 mb-5 flex flex-col items-center text-center relative"
                  style={{
                    background: 'white',
                    border: '1.5px solid #7C3AED',
                    boxShadow: '0 4px 20px rgba(92,46,212,0.10)',
                  }}
                >
                  <div
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider text-white"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    SELECTED
                  </div>
                  {carrierLogo && <CarrierMark name={carrierName} logo={carrierLogo} size="lg" />}
                  <div className="mt-3 text-sm font-semibold text-gray-900">{carrierName}</div>
                  <div className="mt-2">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        background: BRAND_GRADIENT,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {money(totalPremium)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Annual Premium</p>

                  {/* Carrier + package (+ add-ons) breakdown — only once
                      the user has reached the Package step. Before that
                      the carrier premium IS the annual premium, so the
                      breakdown rows would just repeat the headline. */}
                  {packageLabel && (
                    <div
                      className="w-full mt-4 pt-3 text-[11px] text-gray-500 space-y-1"
                      style={{ borderTop: '1px solid #F3F4F6' }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{carrierName} base</span>
                        <span className="font-semibold text-gray-700">{money(carrierPremium)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{packageLabel} package</span>
                        <span className="font-semibold text-gray-700">+{money(packagePremium)}</span>
                      </div>
                      {addonsPremium > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Add-ons</span>
                          <span className="font-semibold text-gray-700">+{money(addonsPremium)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-2xl px-5 py-8 mb-5 text-center"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFB',
                    border: `1px dashed ${isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB'}`,
                  }}
                >
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Select a carrier on the left to see your quote here.
                  </p>
                </div>
              )}

              {/* Steps — soft-tinted gradient circles for every state
                  (matches the success-header chip style on the
                  submission page). Done shows a gradient check; current
                  and upcoming show the step number in gradient text;
                  current adds a soft focus ring + bold label so it
                  stands apart without going to a heavier filled circle. */}
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4 pl-0.5">
                  Where you are
                </div>
                <div className="space-y-5">
                  {QUOTE_STEPS.map((step, idx) => {
                    const isCurrent = idx === currentIdx
                    const isDone    = idx < currentIdx
                    const gradId    = `rpStepCheck-${step.id}`

                    return (
                      <div key={step.id} className="flex items-center gap-4">
                        <span
                          className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                            ...(isCurrent ? { boxShadow: '0 0 0 3px rgba(124,58,237,0.14)' } : {}),
                            opacity: !isCurrent && !isDone ? 0.6 : 1,
                          }}
                        >
                          {isDone ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <defs>
                                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%"   stopColor="#5C2ED4"/>
                                  <stop offset="100%" stopColor="#A614C3"/>
                                </linearGradient>
                              </defs>
                              <path d="M5 13l4 4L19 7" stroke={`url(#${gradId})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
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
                          )}
                        </span>
                        <span
                          className="text-sm leading-tight"
                          style={{
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent
                              ? (isDark ? '#F9FAFB' : '#111827')
                              : isDone
                                ? (isDark ? '#D1D5DB' : '#4B5563')
                                : '#9CA3AF',
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Download Quote Proposal — only unlocks at the Bind & Pay
                  step. Before that the quote isn't final, so showing a
                  download CTA would let the user grab a half-baked PDF. */}
              {(() => {
                const downloadReady = quoteStep === 'bind' && !!carrierName
                return (
                  <>
                    <button
                      type="button"
                      disabled={!downloadReady}
                      onClick={() => { /* hook up real proposal download here */ }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed"
                      style={downloadReady
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
                    {!downloadReady && (
                      <p className="text-[10px] text-gray-400 text-left mt-2 leading-relaxed">
                        Available at the Bind &amp; Pay step.
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
          )
        })()}

      </div>
    </aside>
  )
}
