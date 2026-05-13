import { useState, useMemo } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const PACKAGE_PRICES = {
  base:     { name: 'Base',     premium: 300 },
  silver:   { name: 'Silver',   premium: 300 },
  gold:     { name: 'Gold',     premium: 300 },
  platinum: { name: 'Platinum', premium: 335 },
}

// type: 'always'   = always included, no matter the package
// type: 'package'  = bundled with the currently-selected package
// type: 'optional' = true add-on the user can toggle on (the only kind
//                    that still gets a toggle on this page)
const COVERAGES = [
  { id: 'terrorism',          name: 'Terrorism (TRIA)',                       type: 'always',
    description: 'Terrorism Risk Insurance Act coverage. Included in all Coterie BOP policies.' },
  { id: 'blanket_ai',         name: 'Blanket Additional Insured',             type: 'always',
    description: 'Primary and non-contributory additional insured coverage for contracts. Automatically included.' },
  { id: 'risk_program',       name: 'Manage My Risk Program',                 type: 'package',
    description: "Coterie's risk management program — safety resources, risk assessment tools, and premium savings." },
  { id: 'equipment',          name: 'Equipment Breakdown',                    type: 'package',
    description: 'Covers sudden mechanical or electrical breakdown of business equipment, HVAC, and computers.' },
  { id: 'data_theft',         name: 'Data Theft Protection',                  type: 'package',
    description: 'Covers costs from data breaches including notification, credit monitoring, and legal defense.' },
  { id: 'cyber',              name: 'Cyber Liability',                        type: 'package',
    description: 'Covers cyber attacks, ransomware, data loss, and business interruption from cyber events.' },
  { id: 'hnoa',               name: 'Hired & Non-Owned Auto (HNOA)',          type: 'optional', priceImpact: 15,
    description: 'Covers liability when employees drive personal or rented vehicles for business purposes.' },
  { id: 'damage_premises',    name: 'Increased Damage to Premises Rented',    type: 'optional', priceImpact: 10,
    description: 'Increases the coverage limit for damage to premises you rent — recommended for high-value leased spaces.' },
  { id: 'workplace_violence', name: 'Workplace Violence',                     type: 'optional', priceImpact: 14,
    description: 'Covers costs related to workplace violence incidents including counseling and security.' },
]

const money = (n) => '$' + n.toLocaleString()

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-11 h-6 rounded-full relative transition shrink-0"
      style={{ background: on ? BRAND_GRADIENT : '#D1D5DB' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-all"
        style={{ left: on ? '22px' : '2px', background: 'white' }}
      />
    </button>
  )
}

// Compact label above each section. Same style we use elsewhere.
function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">
      {children}
    </div>
  )
}

// Optional add-on row — the only items on this page that still toggle.
function OptionalCard({ cov, on, onToggle }) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 transition"
      style={{
        background: on ? 'linear-gradient(135deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)' : 'white',
        border: `1px solid ${on ? 'rgba(124,58,237,0.25)' : '#E5E7EB'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 mb-1">{cov.name}</div>
          <p className="text-xs text-gray-500 leading-snug">{cov.description}</p>
        </div>
        <div className="shrink-0 pt-0.5">
          <Toggle on={on} onClick={onToggle} />
        </div>
      </div>
    </div>
  )
}

export default function AddOns({ formData, updateFormData, onBack, onContinue }) {
  const carrier   = formData.bind?.selectedCarrier || 'Coterie'
  const packageId = formData.bind?.packageId || 'gold'
  const packageName = PACKAGE_PRICES[packageId].name

  const included  = COVERAGES.filter(c => c.type === 'always' || c.type === 'package')
  const optionals = COVERAGES.filter(c => c.type === 'optional')

  const stored = formData.bind?.optionalAddons
  const [selected, setSelected] = useState(stored ?? [])

  // Sum the priceImpact of every optional that's currently on
  const optionalsTotal = useMemo(
    () => optionals.reduce((sum, o) => sum + (selected.includes(o.id) ? (o.priceImpact || 0) : 0), 0),
    [selected, optionals]
  )

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setSelected(next)
    const sum = optionals.reduce((s, o) => s + (next.includes(o.id) ? (o.priceImpact || 0) : 0), 0)
    // Persist so the right-rail summary can fold this into the running total
    updateFormData('bind', { optionalAddons: next, addonsPremium: sum })
  }

  const goBack = () => { onBack && onBack() }
  const goContinue = () => {
    updateFormData('bind', { addonsConfirmed: true, optionalAddons: selected, addonsPremium: optionalsTotal })
    if (onContinue) onContinue()
  }

  return (
    <div className="w-full space-y-5">
      <p className="text-sm text-gray-500 -mt-2">
        Customize optional coverages for{' '}
        <span className="font-semibold text-gray-700">{carrier}</span>{' '}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1"
          style={{ background: 'rgba(92,46,212,0.12)', color: '#5C2ED4' }}
        >
          {packageName} Package
        </span>
      </p>

      {/* Included with the package — informational, no toggles. Going back
          to the Package step is how the user changes any of these. */}
      <div>
        <SectionLabel>Included in your {packageName} package</SectionLabel>
        <div
          className="rounded-xl divide-y overflow-hidden"
          style={{ background: 'white', border: '1px solid #E5E7EB', borderColor: '#E5E7EB' }}
        >
          {included.map(c => (
            <div key={c.id} className="px-4 py-3.5 flex items-start gap-3" style={{ borderColor: '#F3F4F6' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional add-ons — the only place toggles live now */}
      <div>
        <SectionLabel>Optional Add-Ons</SectionLabel>
        <div className="space-y-2.5">
          {optionals.map(cov => (
            <OptionalCard
              key={cov.id}
              cov={cov}
              on={selected.includes(cov.id)}
              onToggle={() => toggle(cov.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
          style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
        >
          Back to Package
        </button>
        <button
          type="button"
          onClick={goContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: '0 4px 14px rgba(92,46,212,0.25)',
          }}
        >
          Continue to Review &amp; Pay
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
