import { useState } from 'react'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const PACKAGE_PRICES = {
  base:     { name: 'Base',     premium: 300 },
  silver:   { name: 'Silver',   premium: 300 },
  gold:     { name: 'Gold',     premium: 300 },
  platinum: { name: 'Platinum', premium: 335 },
}

// type: 'always' = always included (green Included badge, no toggle)
// type: 'package' = included in current package (purple badge, toggle on by default, can opt out — increases premium if off)
// type: 'optional' = optional add-on (no badge, toggle off by default, adds to premium if on)
const COVERAGES = [
  { id: 'terrorism', name: 'Terrorism (TRIA)', type: 'always',
    description: 'Terrorism Risk Insurance Act coverage. Included in all Coterie BOP policies.' },
  { id: 'blanket_ai', name: 'Blanket Additional Insured', type: 'always',
    description: 'Primary and non-contributory additional insured coverage for contracts. Automatically included.' },
  { id: 'risk_program', name: 'Manage My Risk Program', type: 'package', priceImpact: 33,
    description: "Coterie's risk management program — includes safety resources, risk assessment tools, and premium savings. Opting out may increase your premium." },
  { id: 'hnoa', name: 'Hired & Non-Owned Auto (HNOA)', type: 'optional', priceImpact: 15,
    description: 'Covers liability when employees drive personal or rented vehicles for business purposes' },
  { id: 'equipment', name: 'Equipment Breakdown', type: 'package', priceImpact: 12,
    description: 'Covers sudden mechanical or electrical breakdown of business equipment, HVAC, and computers' },
  { id: 'damage_premises', name: 'Increased Damage to Premises Rented', type: 'optional', priceImpact: 10,
    description: 'Increases the coverage limit for damage to premises you rent — recommended for high-value leased spaces' },
  { id: 'data_theft', name: 'Data Theft Protection', type: 'package', priceImpact: 18,
    description: 'Covers costs from data breaches including notification, credit monitoring, and legal defense' },
  { id: 'cyber', name: 'Cyber Liability', type: 'package', priceImpact: 25,
    description: 'Covers cyber attacks, ransomware, data loss, and business interruption from cyber events' },
  { id: 'workplace_violence', name: 'Workplace Violence', type: 'optional', priceImpact: 14,
    description: 'Covers costs related to workplace violence incidents including counseling and security' },
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

function CoverageCard({ cov, currentPackageName, selected, onToggle, dirty }) {
  const isAlways = cov.type === 'always'
  const isPackage = cov.type === 'package'

  return (
    <div
      className="rounded-xl px-4 py-3.5 transition"
      style={{
        background: dirty ? 'linear-gradient(135deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)' : 'white',
        border: `1px solid ${dirty ? 'rgba(124,58,237,0.25)' : '#E5E7EB'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-gray-900">{cov.name}</span>
            {isAlways && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(52,211,153,0.16)', color: '#059669' }}
              >
                Included
              </span>
            )}
            {isPackage && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'rgba(92,46,212,0.12)', color: '#5C2ED4' }}
              >
                Included in {currentPackageName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-snug">{cov.description}</p>
        </div>

        {/* Right control */}
        <div className="shrink-0 pt-0.5">
          {isAlways ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <Toggle on={selected} onClick={onToggle} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function AddOns({ formData, updateFormData, onBack, onContinue }) {
  const carrier = formData.bind?.selectedCarrier || 'Coterie'
  const packageId = formData.bind?.packageId || 'gold'
  const packageInfo = PACKAGE_PRICES[packageId]
  const packageName = packageInfo.name
  const basePremium = packageInfo.premium

  // Initial selection: include all "package" and "always" items by default; "optional" off
  const initialSelected = () => {
    const ids = new Set()
    COVERAGES.forEach(c => {
      if (c.type === 'always' || c.type === 'package') ids.add(c.id)
    })
    return [...ids]
  }

  const stored = formData.bind?.coverageSelections
  const [selected, setSelected] = useState(stored ?? initialSelected())
  const [savedPremium, setSavedPremium] = useState(basePremium)

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    setSelected(next)
    updateFormData('bind', { coverageSelections: next })
  }

  // Calculate dynamic premium based on changes from defaults
  const defaults = initialSelected()
  const pendingPremium = (() => {
    let p = basePremium
    COVERAGES.forEach(c => {
      if (!c.priceImpact) return
      const wasDefault = defaults.includes(c.id)
      const isOn = selected.includes(c.id)
      if (c.type === 'package' && wasDefault && !isOn) {
        // Opting out of package-included item — premium goes UP (per dev note)
        p += c.priceImpact
      } else if (c.type === 'optional' && isOn) {
        // Adding optional — premium goes UP
        p += c.priceImpact
      }
    })
    return p
  })()

  const hasChanges = pendingPremium !== savedPremium
  const isDirty = (id) => {
    const wasDefault = defaults.includes(id)
    const isOn = selected.includes(id)
    return wasDefault !== isOn
  }

  const updatePrice = () => {
    setSavedPremium(pendingPremium)
  }

  const goBack = () => { onBack && onBack() }

  const goContinue = () => {
    updateFormData('bind', { addonsConfirmed: true, finalPremium: savedPremium })
    if (onContinue) onContinue()
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-gray-500 -mt-2">
        Customize optional coverages for <span className="font-semibold text-gray-700">{carrier}</span>{' '}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1"
          style={{ background: 'rgba(92,46,212,0.12)', color: '#5C2ED4' }}
        >
          {packageName} Package
        </span>
      </p>

      {/* Premium card */}
      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between"
        style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-0.5">{packageName} Premium</div>
          <div className="text-2xl font-bold text-gray-900">
            {money(savedPremium)}<span className="text-sm font-normal text-gray-400">/year</span>
          </div>
        </div>
        {hasChanges && (
          <button
            type="button"
            onClick={updatePrice}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{
              background: BRAND_GRADIENT,
              boxShadow: '0 2px 10px rgba(92,46,212,0.25)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            Update Price
          </button>
        )}
      </div>

      {/* Coverage list */}
      <div className="space-y-2.5">
        {COVERAGES.map(cov => (
          <CoverageCard
            key={cov.id}
            cov={cov}
            currentPackageName={packageName}
            selected={selected.includes(cov.id)}
            dirty={isDirty(cov.id)}
            onToggle={() => toggle(cov.id)}
          />
        ))}
      </div>

      {/* Current Premium (compact summary at bottom) */}
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{
          background: hasChanges
            ? 'linear-gradient(135deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)'
            : '#F9FAFB',
          border: `1px solid ${hasChanges ? 'rgba(124,58,237,0.18)' : '#E5E7EB'}`,
        }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-0.5">Current Premium</div>
          <div className="text-lg font-bold text-gray-900">
            {money(savedPremium)}<span className="text-xs font-normal text-gray-400">/year</span>
          </div>
        </div>
        {hasChanges && (
          <div className="text-right">
            <div className="text-[10px] text-gray-400">After update</div>
            <div className="text-sm font-bold" style={{ color: '#5C2ED4' }}>
              {money(pendingPremium)}/yr
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          type="button"
          onClick={goBack}
          className="px-5 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-50"
          style={{ color: '#374151', border: '1.5px solid #E5E7EB', background: 'white' }}
        >
          Back to Quotes
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
