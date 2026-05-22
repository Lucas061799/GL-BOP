import { useState, useMemo } from 'react'
import { Select } from '../../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

// subClasses are the more specific business-type variations that sit
// under each NAICS main class. After the user picks a main class on
// PageZero we land here showing only the matching sub-options for
// that class — the user picks the most specific match so we can
// route the underwriting correctly.
const SAMPLE_CLASSES = [
  {
    id: '722511', description: 'Full-Service Restaurants', naics: '722511',
    naicsDescription: 'Restaurants offering full service to seated patrons',
    carriers: ['Coterie', 'Hiscox', 'CNA'],
    subClasses: [
      { value: '722511.01', label: '722511.01 — Casual dining (mid-tier sit-down)' },
      { value: '722511.02', label: '722511.02 — Fine dining (upscale, table service)' },
      { value: '722511.03', label: '722511.03 — Family-style restaurant' },
      { value: '722511.04', label: '722511.04 — Ethnic or specialty cuisine' },
      { value: '722511.05', label: '722511.05 — Bar & grill (restaurant with full bar)' },
    ],
  },
  {
    id: '812111', description: 'Barber Shops', naics: '812111',
    naicsDescription: 'Personal grooming services',
    carriers: ['Coterie', 'Hiscox'],
    subClasses: [
      { value: '812111.01', label: '812111.01 — Traditional barber shop' },
      { value: '812111.02', label: "812111.02 — Modern men's grooming lounge" },
      { value: '812111.03', label: '812111.03 — Combination barber & beauty shop' },
    ],
  },
  {
    id: '561730', description: 'Landscaping Services', naics: '561730',
    naicsDescription: 'Landscape installation and maintenance',
    carriers: ['Coterie', 'Great American'],
    subClasses: [
      { value: '561730.01', label: '561730.01 — Residential lawn care & maintenance' },
      { value: '561730.02', label: '561730.02 — Commercial landscaping' },
      { value: '561730.03', label: '561730.03 — Landscape installation / hardscaping' },
      { value: '561730.04', label: '561730.04 — Tree trimming & removal' },
      { value: '561730.05', label: '561730.05 — Irrigation system installation' },
    ],
  },
  {
    id: '541611', description: 'Management Consulting Services', naics: '541611',
    naicsDescription: 'Administrative and general management consulting',
    carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'],
    subClasses: [
      { value: '541611.01', label: '541611.01 — General management consulting' },
      { value: '541611.02', label: '541611.02 — Strategy consulting' },
      { value: '541611.03', label: '541611.03 — Human resources consulting' },
      { value: '541611.04', label: '541611.04 — Operations / process consulting' },
    ],
  },
  {
    id: '541330', description: 'Engineering Services', naics: '541330',
    naicsDescription: 'Applying engineering principles to design',
    carriers: ['Hiscox', 'CNA'],
    subClasses: [
      { value: '541330.01', label: '541330.01 — Civil engineering' },
      { value: '541330.02', label: '541330.02 — Mechanical engineering' },
      { value: '541330.03', label: '541330.03 — Electrical engineering' },
      { value: '541330.04', label: '541330.04 — Structural engineering' },
      { value: '541330.05', label: '541330.05 — Environmental engineering' },
    ],
  },
  {
    id: '541110', description: 'Offices of Lawyers', naics: '541110',
    naicsDescription: 'Legal services',
    carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'],
    subClasses: [
      { value: '541110.01', label: '541110.01 — General practice' },
      { value: '541110.02', label: '541110.02 — Corporate / business law' },
      { value: '541110.03', label: '541110.03 — Family law' },
      { value: '541110.04', label: '541110.04 — Criminal defense' },
      { value: '541110.05', label: '541110.05 — Personal injury' },
      { value: '541110.06', label: '541110.06 — Real estate / transactional' },
    ],
  },
  {
    id: '238210', description: 'Electrical Contractors', naics: '238210',
    naicsDescription: 'Installing and servicing electrical wiring',
    carriers: ['CNA', 'Great American'],
    subClasses: [
      { value: '238210.01', label: '238210.01 — Residential electrical' },
      { value: '238210.02', label: '238210.02 — Commercial electrical' },
      { value: '238210.03', label: '238210.03 — Low-voltage / data wiring' },
      { value: '238210.04', label: '238210.04 — Solar / renewable installation' },
    ],
  },
  {
    id: '238220', description: 'Plumbing, Heating & A/C Contractors', naics: '238220',
    naicsDescription: 'Installing and servicing plumbing and HVAC',
    carriers: ['CNA', 'Great American'],
    subClasses: [
      { value: '238220.01', label: '238220.01 — Plumbing only' },
      { value: '238220.02', label: '238220.02 — HVAC only' },
      { value: '238220.03', label: '238220.03 — Combined plumbing & HVAC' },
      { value: '238220.04', label: '238220.04 — Residential service' },
      { value: '238220.05', label: '238220.05 — Commercial service' },
    ],
  },
  {
    id: '454110', description: 'Electronic Shopping & Mail-Order', naics: '454110',
    naicsDescription: 'Retailers selling online or by mail-order',
    carriers: ['Coterie', 'Hiscox'],
    subClasses: [
      { value: '454110.01', label: '454110.01 — General online retail' },
      { value: '454110.02', label: '454110.02 — Apparel & accessories' },
      { value: '454110.03', label: '454110.03 — Electronics & tech' },
      { value: '454110.04', label: '454110.04 — Home goods' },
      { value: '454110.05', label: '454110.05 — Food & beverage' },
    ],
  },
  {
    id: '812112', description: 'Beauty Salons', naics: '812112',
    naicsDescription: 'Hair, nail, and skin care services',
    carriers: ['Coterie', 'Hiscox'],
    subClasses: [
      { value: '812112.01', label: '812112.01 — Hair salon' },
      { value: '812112.02', label: '812112.02 — Nail salon' },
      { value: '812112.03', label: '812112.03 — Skin care / facials' },
      { value: '812112.04', label: '812112.04 — Full-service salon & spa' },
    ],
  },
  {
    id: '624410', description: 'Child Day Care Services', naics: '624410',
    naicsDescription: 'Day care of infants and children',
    carriers: ['Great American'],
    subClasses: [
      { value: '624410.01', label: '624410.01 — Home-based day care' },
      { value: '624410.02', label: '624410.02 — Center-based day care' },
      { value: '624410.03', label: '624410.03 — Pre-K / preschool' },
      { value: '624410.04', label: '624410.04 — After-school program' },
    ],
  },
  {
    id: '722513', description: 'Limited-Service Restaurants', naics: '722513',
    naicsDescription: 'Quick-service restaurants',
    carriers: ['Coterie', 'Hiscox', 'CNA'],
    subClasses: [
      { value: '722513.01', label: '722513.01 — Fast food / quick-service' },
      { value: '722513.02', label: '722513.02 — Coffee shop / café' },
      { value: '722513.03', label: '722513.03 — Food truck / mobile vendor' },
      { value: '722513.04', label: '722513.04 — Take-out only' },
      { value: '722513.05', label: '722513.05 — Pizzeria (delivery / pickup)' },
    ],
  },
  {
    id: '541211', description: 'Offices of CPAs', naics: '541211',
    naicsDescription: 'Accounting and bookkeeping services',
    carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'],
    subClasses: [
      { value: '541211.01', label: '541211.01 — Accounting & bookkeeping' },
      { value: '541211.02', label: '541211.02 — Tax preparation' },
      { value: '541211.03', label: '541211.03 — Auditing services' },
      { value: '541211.04', label: '541211.04 — Financial planning' },
    ],
  },
]

const ALL_CARRIERS = ['Coterie', 'Hiscox', 'CNA', 'Great American']

function CarrierChip({ name }) {
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap"
      style={{ border: '1px solid rgba(92,46,212,0.25)', background: '#ffffff' }}
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

function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5 pl-0.5">
      <span style={{ color: '#9CA3AF' }}>{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
        {children}
      </span>
    </div>
  )
}

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const TagIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5z"/>
    <circle cx="6" cy="9" r="1"/>
  </svg>
)

export default function SmartStart({ formData, updateFormData, isDark = false, showErrors = false }) {
  const [query, setQuery] = useState('')
  const selected = formData.smartStart?.classId
  const subSelected = formData.smartStart?.subClassId

  const selectedClass = SAMPLE_CLASSES.find(c => c.id === selected)

  // Search mode is off by default when we land here with a class
  // already chosen from PageZero — the user picked the main class
  // there, so this page now refines into a sub-classification. The
  // "Change class code" CTA flips this on if the user realises they
  // picked the wrong main class.
  const [searchMode, setSearchMode] = useState(!selectedClass)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return SAMPLE_CLASSES.filter(c =>
      c.description.toLowerCase().includes(q) ||
      c.naicsDescription.toLowerCase().includes(q) ||
      c.naics.includes(q)
    )
  }, [query])

  const selectClass = (cls) => {
    updateFormData('smartStart', {
      classId: cls.id,
      description: cls.description,
      naics: cls.naics,
      carriers: cls.carriers,
      // Reset the sub-class whenever the parent class changes —
      // last main class's sub-options don't apply.
      subClassId: undefined,
    })
    setQuery('')
    setSearchMode(false)
  }

  const setSubClass = (subValue) => {
    updateFormData('smartStart', { subClassId: subValue })
  }

  const clearClass = () => {
    updateFormData('smartStart', {
      classId: undefined,
      description: undefined,
      naics: undefined,
      carriers: undefined,
      subClassId: undefined,
    })
    setSearchMode(true)
  }

  const openSearch = () => setSearchMode(true)
  const cancelSearch = () => { setQuery(''); setSearchMode(false) }

  const sectionCardStyle = {
    background: 'white',
    border: '1px solid #EAEAEA',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div className="w-full space-y-6">
      {/* Strip every browser-applied fill from the search input —
          Chrome paints autofill chips with a yellow/blue background
          even when bg-transparent is set, and the typed text color
          needs to flip in dark mode. */}
      <style>{`
        .ss-search-input { color: #1F2937; }
        [data-dark="true"] .ss-search-input { color: #F9FAFB; }
        .ss-search-input:-webkit-autofill,
        .ss-search-input:-webkit-autofill:hover,
        .ss-search-input:-webkit-autofill:focus,
        .ss-search-input:-webkit-autofill:active {
          -webkit-box-shadow: inset 0 0 0 1000px transparent !important;
          -webkit-text-fill-color: #1F2937 !important;
          caret-color: #1F2937 !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        [data-dark="true"] .ss-search-input:-webkit-autofill,
        [data-dark="true"] .ss-search-input:-webkit-autofill:hover,
        [data-dark="true"] .ss-search-input:-webkit-autofill:focus,
        [data-dark="true"] .ss-search-input:-webkit-autofill:active {
          -webkit-text-fill-color: #F9FAFB !important;
          caret-color: #F9FAFB !important;
        }
      `}</style>

      {/* Subtitle adapts to whether we're in refine mode or search mode */}
      <p className="text-sm text-gray-500 -mt-2">
        {searchMode
          ? "Type a class code or describe your client's business."
          : "We pulled these based on what you selected — pick the one that best describes the business."}
      </p>

      {/* === REFINE MODE === — class already chosen on PageZero, user
          picks a more specific sub-classification. Search is hidden
          unless they tap "Change class code" below. */}
      {!searchMode && selectedClass && (
        <>
          {/* Selected (parent) class banner */}
          <div
            className="rounded-xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{
              background: isDark
                ? 'linear-gradient(88.09deg, rgba(167,139,250,0.18) 0%, rgba(232,121,249,0.18) 100%)'
                : 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)',
              border: `1px solid ${isDark ? 'rgba(167,139,250,0.45)' : 'rgba(92,46,212,0.22)'}`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: BRAND_GRADIENT }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: isDark ? '#F9FAFB' : '#1F2937' }}>{selectedClass.description}</div>
              <div className="text-xs mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                <span className="font-mono font-semibold" style={{ color: isDark ? '#C4B5FD' : '#5C2ED4' }}>NAICS {selectedClass.naics}</span>
                <span className="mx-1">·</span>
                <span>{selectedClass.naicsDescription}</span>
              </div>
            </div>
          </div>

          {/* Refine card — "Let's dig a little deeper" + sub-class dropdown */}
          {(() => {
            const showSubError = showErrors && !subSelected
            return (
              <div
                className="rounded-xl p-5 sm:p-6"
                style={{ background: isDark ? 'rgba(30,33,58,0.6)' : '#F9FAFB', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(124,58,237,0.10)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                      <path d="M11 8v6M8 11h6"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold mb-0.5" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                      Let's dig a little deeper
                    </h3>
                    <p className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Pick the option that best describes the business so we can match the right coverage.
                    </p>
                  </div>
                </div>

                <Select
                  label="Specific business type"
                  required
                  options={selectedClass.subClasses || []}
                  value={subSelected}
                  onChange={setSubClass}
                  placeholder="Select a more specific match..."
                  error={showSubError}
                />

                <div
                  className="flex items-center justify-between gap-3 mt-4 pt-4"
                  style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}` }}
                >
                  <span className="text-[12px]" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    Wrong class code?
                  </span>
                  <button
                    type="button"
                    onClick={openSearch}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition hover:opacity-70"
                    style={{ color: isDark ? '#C4B5FD' : '#5C2ED4' }}
                  >
                    Change class code
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })()}
        </>
      )}

      {/* === SEARCH MODE === — search bar + result list. Used either when
          no class has been seeded yet (direct nav / dev) or when the
          user explicitly hit "Change class code" above. */}
      {searchMode && (() => {
        const showRequiredError = showErrors && !selectedClass
        return (
          <>
            <div>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition"
                style={{
                  background: 'white',
                  border: showRequiredError ? '1.5px solid #FCA5A5' : '1.5px solid #EAEAEA',
                  boxShadow: showRequiredError ? '0 0 0 2px rgba(252,165,165,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span className="text-gray-400 shrink-0"><SearchIcon size={18} /></span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by class code or business type (e.g. 722511 or restaurant)"
                  autoComplete="off"
                  spellCheck={false}
                  className="ss-search-input flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 -mr-1 rounded transition hover:bg-gray-100 shrink-0"
                    aria-label="Clear search"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                )}
              </div>
              {showRequiredError && (
                <p className="text-[10px] text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                  <span>⚠</span> Pick a class code to continue
                </p>
              )}
              {/* Keep-current escape hatch — only meaningful if we
                  already have a class on file to fall back to. */}
              {selectedClass && (
                <button
                  type="button"
                  onClick={cancelSearch}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold mt-2 transition hover:opacity-70"
                  style={{ color: isDark ? '#C4B5FD' : '#5C2ED4' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Keep current class
                </button>
              )}
            </div>

            {query && results.length > 0 && (
              <div>
                <SectionLabel icon={<TagIcon />}>
                  {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
                </SectionLabel>
                <div className="space-y-2.5">
                  {results.map(cls => {
                    const isSelected = selected === cls.id
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => selectClass(cls)}
                        className="w-full text-left rounded-xl px-4 sm:px-5 py-3.5 transition-all hover:-translate-y-px"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(88.09deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)'
                            : 'white',
                          border: `1.5px solid ${isSelected ? '#7C3AED' : '#EAEAEA'}`,
                          boxShadow: isSelected
                            ? '0 4px 18px rgba(92,46,212,0.12)'
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-800 mb-1">{cls.description}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                              <span
                                className="px-1.5 py-0.5 rounded font-mono font-semibold text-[10px] shrink-0 whitespace-nowrap"
                                style={{ background: 'rgba(92,46,212,0.08)', color: '#5C2ED4' }}
                              >
                                NAICS {cls.naics}
                              </span>
                              <span className="truncate">{cls.naicsDescription}</span>
                            </div>
                          </div>
                          <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={isSelected ? '#5C2ED4' : '#9CA3AF'}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="shrink-0"
                          >
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {query && results.length === 0 && (
              <div className="rounded-xl p-10 text-center" style={sectionCardStyle}>
                <p className="text-sm text-gray-500">
                  No class codes match "<span className="font-semibold text-gray-700">{query}</span>". Try a different keyword.
                </p>
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}
