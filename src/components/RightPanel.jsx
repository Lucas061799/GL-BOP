import { useState, useRef, useEffect, useMemo } from 'react'
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

function SkeletonRow() {
  return (
    <div className="rounded-xl px-3 py-3 flex items-center gap-3" style={{ background: '#FAFAFB', border: '1px solid #F3F4F6' }}>
      <div className="skel w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="skel h-3 rounded w-14" />
        <div className="skel h-3 rounded w-12" />
      </div>
      <style>{`
        .skel { background: linear-gradient(90deg, #EEF2F7 0%, #F8FAFC 50%, #EEF2F7 100%); background-size: 200% 100%; animation: skelShimmer 1.4s ease-in-out infinite; }
        @keyframes skelShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}

export default function RightPanel({ onFormReview, formData = {}, pulseUpload = false, isDark = false }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const inputRef = useRef()

  const completion = useMemo(() => getSectionCompletion(formData), [formData])
  const completedCount = Object.values(completion).filter(Boolean).length
  const progressPct = Math.round((completedCount / 7) * 100)

  // We can show estimates as soon as the user has picked a class code and
  // entered at least one financial input (revenue, payroll, or employee count).
  // The numbers refine live as more fields are filled.
  const b = formData.business || {}
  const hasAnyFinancial = !!(
    Number(String(b.annualRevenue   || '').replace(/[^0-9]/g, '')) ||
    Number(String(b.annualPayroll   || '').replace(/[^0-9]/g, '')) ||
    Number(String(b.numberOfEmployees || '').replace(/[^0-9]/g, ''))
  )
  const readyToQuote = !!(formData.smartStart?.classId && hasAnyFinancial)

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

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({ name: f.name, size: f.size, id: Math.random() }))
    setFiles(prev => [...prev, ...arr])
  }
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))
  const formatSize = (bytes) => bytes < 1024 ? bytes + ' bytes' : Math.round(bytes / 1024) + ' KB'

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
              style={{ background: '#FAFAFB', border: '1px solid #F3F4F6' }}
            >
              <div className="skel w-14 h-14 rounded-xl" />
              <div className="skel h-8 w-32 rounded" />
              <div className="skel h-3 w-20 rounded" />
            </div>
          ) : (
            <div
              className="rounded-2xl px-5 py-5 mb-3 flex flex-col items-center text-center relative overflow-hidden"
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
                BEST
              </div>
              <CarrierMark name={quotes[0].name} logo={quotes[0].logo} size="lg" />
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
                  {money(quotes[0].premium)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Annual Premium</p>
            </div>
          )}

          {/* Remaining carriers */}
          <div className="space-y-2">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              : quotes.slice(1).map(q => (
                  <div
                    key={q.id}
                    className="rounded-xl px-3 py-3 flex items-center gap-3 transition hover:border-gray-300"
                    style={{ background: 'white', border: '1px solid #E5E7EB' }}
                  >
                    <CarrierMark name={q.name} logo={q.logo} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-700 truncate">{q.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-gray-900 leading-tight">{money(q.premium)}</div>
                      <div className="text-[9px] text-gray-400">per year</div>
                    </div>
                  </div>
                ))
            }
          </div>

          {!readyToQuote && (
            <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
              Pick a class code and enter revenue or payroll to see live quotes.
            </p>
          )}
        </div>

        {/* Upload & Save Time */}
        <div className={`mb-5 rounded-2xl overflow-hidden transition-all ${pulseUpload ? 'upload-pulse' : ''}`} style={{ border: isDark ? '1px solid rgba(92,46,212,0.25)' : '1px solid #E5E7EB', background: isDark ? 'rgba(92,46,212,0.12)' : 'white' }}>
          <div className="px-4 pt-4 pb-4">
            <h3 className="text-base font-bold text-navy leading-tight mb-0.5">Upload & Save Time!</h3>
            <div className="flex items-center gap-1.5 mb-3">
              <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Competitor quote or ACORD form?</p>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold" style={{ background: '#73C9B7' }}>i</div>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              className={`rounded-xl border-2 border-dashed transition-all px-3 pt-3 pb-3 ${dragging ? 'border-[#5C2ED4] bg-[#5C2ED4]/5' : 'border-[#A614C3]/25'}`}
            >
              <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.png" className="hidden" onChange={e => addFiles(e.target.files)} />
              <p className="text-center text-[10px] text-gray-400 mb-2">
                Drop a file or <span className="font-semibold text-gray-500">drag &amp; drop</span> · PDF, JPG, PNG · Max 10MB
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: BRAND_GRADIENT }}
              >
                Upload Here
              </button>
            </div>
          </div>
        </div>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="mb-4 space-y-2">
            {files.map(f => (
              <div key={f.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F3F4F6' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700 truncate max-w-[120px]">{f.name}</p>
                    <p className="text-[9px] text-gray-400">{formatSize(f.size)}</p>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); removeFile(f.id) }}>
                  <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form Review button */}
        <button
          onClick={onFormReview}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition"
          style={{
            color: isDark ? '#D8B4FE' : '#A614C3',
            border: isDark ? '1px solid rgba(216,180,254,0.35)' : '1px solid rgba(166,20,195,0.3)',
            background: isDark ? 'rgba(167,139,250,0.08)' : 'white',
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.15)' : 'rgba(166,20,195,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.08)' : 'white'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Form Review
        </button>

      </div>
    </aside>
  )
}
