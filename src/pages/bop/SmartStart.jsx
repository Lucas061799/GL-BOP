import { useState, useMemo } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const SAMPLE_CLASSES = [
  { id: '722511', description: 'Full-Service Restaurants',         naics: '722511', naicsDescription: 'Restaurants offering full service to seated patrons', carriers: ['Coterie', 'Hiscox', 'CNA'] },
  { id: '812111', description: 'Barber Shops',                     naics: '812111', naicsDescription: 'Personal grooming services',                          carriers: ['Coterie', 'Hiscox'] },
  { id: '561730', description: 'Landscaping Services',             naics: '561730', naicsDescription: 'Landscape installation and maintenance',              carriers: ['Coterie', 'Great American'] },
  { id: '541611', description: 'Management Consulting Services',   naics: '541611', naicsDescription: 'Administrative and general management consulting',     carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'] },
  { id: '541330', description: 'Engineering Services',             naics: '541330', naicsDescription: 'Applying engineering principles to design',            carriers: ['Hiscox', 'CNA'] },
  { id: '541110', description: 'Offices of Lawyers',               naics: '541110', naicsDescription: 'Legal services',                                       carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'] },
  { id: '238210', description: 'Electrical Contractors',           naics: '238210', naicsDescription: 'Installing and servicing electrical wiring',           carriers: ['CNA', 'Great American'] },
  { id: '238220', description: 'Plumbing, Heating & A/C Contractors', naics: '238220', naicsDescription: 'Installing and servicing plumbing and HVAC',         carriers: ['CNA', 'Great American'] },
  { id: '454110', description: 'Electronic Shopping & Mail-Order', naics: '454110', naicsDescription: 'Retailers selling online or by mail-order',            carriers: ['Coterie', 'Hiscox'] },
  { id: '812112', description: 'Beauty Salons',                    naics: '812112', naicsDescription: 'Hair, nail, and skin care services',                  carriers: ['Coterie', 'Hiscox'] },
  { id: '624410', description: 'Child Day Care Services',          naics: '624410', naicsDescription: 'Day care of infants and children',                    carriers: ['Great American'] },
  { id: '722513', description: 'Limited-Service Restaurants',      naics: '722513', naicsDescription: 'Quick-service restaurants',                            carriers: ['Coterie', 'Hiscox', 'CNA'] },
  { id: '541211', description: 'Offices of CPAs',                  naics: '541211', naicsDescription: 'Accounting and bookkeeping services',                  carriers: ['Coterie', 'Hiscox', 'CNA', 'Great American'] },
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

export default function SmartStart({ formData, updateFormData }) {
  const [query, setQuery] = useState('')
  const selected = formData.smartStart?.classId

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return SAMPLE_CLASSES.filter(c =>
      c.description.toLowerCase().includes(q) ||
      c.naicsDescription.toLowerCase().includes(q) ||
      c.naics.includes(q)
    )
  }, [query])

  const selectedClass = SAMPLE_CLASSES.find(c => c.id === selected)

  const selectClass = (cls) => {
    updateFormData('smartStart', {
      classId: cls.id,
      description: cls.description,
      naics: cls.naics,
      carriers: cls.carriers,
    })
  }

  const clearClass = () => {
    updateFormData('smartStart', {
      classId: undefined,
      description: undefined,
      naics: undefined,
      carriers: undefined,
    })
  }

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

      {/* Subtitle */}
      <p className="text-sm text-gray-500 -mt-2">
        Type a class code or describe your client's business.
      </p>

      {/* Search section — no SECTION LABEL, no empty-state box, no extra magnifying glasses */}
      <div>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition"
          style={{
            background: 'white',
            border: '1.5px solid #EAEAEA',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <span className="text-gray-400 shrink-0"><SearchIcon size={18} /></span>
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              // If the user starts typing while a class is already
              // selected, drop the selection so the fresh search
              // results show below.
              if (e.target.value && selectedClass) {
                clearClass()
              }
            }}
            placeholder="Search by class code or business type (e.g. 722511 or restaurant)"
            // autoComplete=off + the inline -webkit-box-shadow trick
            // keeps Chrome from painting a yellow/blue autofill fill
            // over our transparent input.
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
      </div>

      {/* Selected class banner — shows below the search input as current state */}
      {selectedClass && (
        <div
          className="rounded-xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{
            background: 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)',
            border: '1px solid rgba(92,46,212,0.22)',
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
            <div className="text-sm font-semibold text-gray-800">{selectedClass.description}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              <span className="font-mono font-semibold" style={{ color: '#5C2ED4' }}>NAICS {selectedClass.naics}</span>
              <span className="mx-1">·</span>
              <span>type above to change</span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearClass}
            className="p-1 -mr-1 rounded transition hover:opacity-70 shrink-0 self-start sm:self-center"
            aria-label="Clear selected class code"
            title="Clear selection"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Results — hidden once a class is selected. Clear the X on the
          selected banner to search again. */}
      {!selectedClass && query && results.length > 0 && (
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
                    {/* Left: title + NAICS + description */}
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

                    {/* Arrow */}
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

      {!selectedClass && query && results.length === 0 && (
        <div className="rounded-xl p-10 text-center" style={sectionCardStyle}>
          <p className="text-sm text-gray-500">
            No class codes match "<span className="font-semibold text-gray-700">{query}</span>". Try a different keyword.
          </p>
        </div>
      )}
    </div>
  )
}
