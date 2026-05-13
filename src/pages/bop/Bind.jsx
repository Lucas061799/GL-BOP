import { useState, useMemo } from 'react'
import { Input, FormGrid } from '../../components/FormField'

const BRAND_GRADIENT = 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'

const PAYMENT_PLANS = [
  { value: 'Annual',  label: 'Pay in Full', period: 'year' },
  { value: 'Monthly', label: 'Monthly',     period: 'mo', subtitle: 'Includes installment fees' },
]

// Carrier sample premiums — broken down to mirror the Coterie reference
const SAMPLE_PREMIUMS = {
  Coterie:          { basePremium: 300, policyFee: 50, riskProgram: 33,  total: 390, monthly: 35, installmentFee: 0 },
  Hiscox:           { basePremium: 360, policyFee: 40, riskProgram: 0,   total: 400, monthly: 36, installmentFee: 0 },
  CNA:              { basePremium: 420, policyFee: 50, riskProgram: 0,   total: 470, monthly: 42, installmentFee: 5 },
  'Great American': { basePremium: 480, policyFee: 60, riskProgram: 0,   total: 540, monthly: 48, installmentFee: 0 },
}

const CONSENTS = [
  { key: 'fraud',  label: 'I acknowledge the fraud warning statement for my state' },
  { key: 'svcFee', label: 'I agree to the BTIS service fee of $75' },
  { key: 'broker', label: 'I acknowledge the broker disclosure statement' },
  { key: 'esign',  label: 'I consent to electronic delivery of documents' },
]

const money = (n) => '$' + Math.round(n).toLocaleString()
const money2 = (n) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// =============================================================================
// Input 1 Payments modal — mock placeholder for the real payment processor.
// In production the iframe from Input 1 would render inside this dialog; we
// stub it here with a labeled placeholder + a single Complete Payment button.
// =============================================================================
function Input1Modal({ open, amount, onClose, onComplete }) {
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onComplete()
    }, 900)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10"
          style={{ background: '#F5F3FF', borderBottom: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span className="text-sm font-semibold text-gray-800">
              Complete Fee Payment — {money2(amount)}
            </span>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 pt-6 pb-4">
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #7DD3FC 0%, #0EA5E9 70%, #0369A1 100%)',
              boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)',
            }}
          >
            <span className="text-white font-bold italic" style={{ fontFamily: 'Georgia, serif', fontSize: 18 }}>i1</span>
          </div>
          <div>
            <div className="text-2xl font-bold italic text-gray-900 leading-none" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>
              INPUT 1
            </div>
            <div className="text-[10px] font-semibold tracking-[0.3em] text-right" style={{ color: '#0EA5E9' }}>
              PAYMENTS
            </div>
          </div>
        </div>

        {/* Body — placeholder for the real iframe */}
        <div className="px-5 pb-5">
          <div
            className="rounded-lg p-6 text-center"
            style={{
              border: '1.5px dashed #C7D2FE',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.04) 0%, rgba(92,46,212,0.04) 100%)',
            }}
          >
            <div
              className="inline-flex w-10 h-10 items-center justify-center rounded-full mb-2"
              style={{ background: 'rgba(14,165,233,0.12)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Input 1 Payments interface
            </p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              The real Input 1 payment form is embedded here in production.
              For this demo, click below to simulate a successful payment.
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 mb-3">
            <span className="text-sm text-gray-600">Amount due</span>
            <span className="text-lg font-bold text-gray-900">{money2(amount)}</span>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            style={{
              background: BRAND_GRADIENT,
              boxShadow: submitting ? 'none' : '0 4px 14px rgba(92,46,212,0.25)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                  <path strokeLinecap="round" d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Processing…
              </>
            ) : (
              <>Complete Payment · {money2(amount)}</>
            )}
          </button>

          {/* Secure footer */}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secured by Input 1 Payments · PCI DSS compliant
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldRow({ label, value, bold, muted }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span style={{ color: muted ? '#9CA3AF' : '#6B7280', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-gray-800" style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

function ConsentRow({ label, checked, onChange }) {
  return (
    <label
      className="flex items-center gap-3 cursor-pointer rounded-lg px-3.5 py-3 transition select-none"
      style={{
        background: checked ? 'rgba(124,58,237,0.06)' : 'white',
        border: `1.5px solid ${checked ? '#7C3AED' : '#E5E7EB'}`,
      }}
      onClick={() => onChange(!checked)}
    >
      <span
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition"
        style={{
          background: checked ? BRAND_GRADIENT : 'white',
          border: `1.5px solid ${checked ? 'transparent' : '#D1D5DB'}`,
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="text-[13px] text-gray-700 leading-snug">{label}</span>
    </label>
  )
}

export default function Bind({ formData, updateFormData, onGoToStep, onBound }) {
  const carrier = formData.bind?.selectedCarrier
  const quote = SAMPLE_PREMIUMS[carrier] || SAMPLE_PREMIUMS.Coterie

  const [frequency, setFrequency] = useState('Annual')
  const [brokerFee, setBrokerFee] = useState(0)
  const [disclosuresOpen, setDisclosuresOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [fraudOpen, setFraudOpen] = useState(false)

  const contact = formData.bindContact || {}
  const setContact = (id) => (val) => updateFormData('bindContact', { [id]: val })

  const consents = formData.bindConsents || {}
  const setConsent = (key, val) => updateFormData('bindConsents', { [key]: val })

  const btisServiceFee = 75
  const brokerFeeNum = Number(brokerFee) || 0
  const totalFees = btisServiceFee + brokerFeeNum

  const annualPremium = quote.total
  const isAnnual = frequency === 'Annual'
  const installmentFee = !isAnnual ? (quote.installmentFee || 0) : 0
  const premiumPortion = isAnnual ? annualPremium : (quote.monthly + installmentFee)
  const dueToday = totalFees + premiumPortion

  const allConsented = useMemo(() => CONSENTS.every(c => consents[c.key]), [consents])
  const contactReady = !!(contact.firstName && contact.lastName && contact.email)
  const canBind = allConsented && contactReady

  if (!carrier) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{ background: '#FAFAFB', border: '1.5px dashed #E5E7EB' }}
      >
        <div
          className="inline-flex w-12 h-12 items-center justify-center rounded-full mb-3"
          style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No carrier selected</p>
        <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
          Pick a carrier from the Compare section above to review payment details and bind your policy.
        </p>
        <button
          type="button"
          onClick={() => onGoToStep && onGoToStep(6)}
          className="text-xs font-semibold px-4 py-2 rounded-lg transition"
          style={{ color: '#5C2ED4', border: '1.5px solid rgba(92,46,212,0.35)', background: 'white' }}
        >
          Go to Compare →
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-5">
        {/* ============ TOP: ACKNOWLEDGMENTS ============ */}

        {/* Colorado Fraud Warning — compact, collapsible */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #E5E7EB' }}
        >
          <button
            type="button"
            onClick={() => setFraudOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(124,58,237,0.10)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C2ED4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div className="text-left min-w-0">
                <div className="text-[13px] font-semibold text-gray-800 truncate">Colorado Fraud Warning</div>
                <div className="text-[11px] text-gray-400 truncate">Required state disclosure · Tap to read.</div>
              </div>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-transform"
              style={{ transform: fraudOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {fraudOpen && (
            <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: '#F3F4F6' }}>
              <p className="text-[12px] leading-relaxed text-gray-600 pt-3">
                It is unlawful to knowingly provide false, incomplete, or misleading facts or information to an insurance
                company for the purpose of defrauding or attempting to defraud the company. Penalties may include
                imprisonment, fines, denial of insurance, and civil damages. Any insurance company or agent of an
                insurance company who knowingly provides false, incomplete, or misleading facts or information to a
                policyholder or claimant for the purpose of defrauding or attempting to defraud the policyholder or
                claimant with regard to a settlement or award payable from insurance proceeds shall be reported to the
                Colorado Division of Insurance within the Department of Regulatory Agencies.
              </p>
            </div>
          )}
        </div>

        {/* Terms & Acknowledgments — compact accept-all */}
        {(() => {
          const acceptedCount = CONSENTS.filter(c => !!consents[c.key]).length
          const allDone = acceptedCount === CONSENTS.length
          const toggleAll = () => {
            const next = !allDone
            CONSENTS.forEach(c => setConsent(c.key, next))
          }
          return (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: allDone ? 'rgba(124,58,237,0.06)' : 'white',
                border: `1.5px solid ${allDone ? '#7C3AED' : '#E5E7EB'}`,
                boxShadow: allDone ? '0 2px 12px rgba(92,46,212,0.10)' : 'none',
              }}
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex-1 flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50 text-left min-w-0"
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition"
                    style={{
                      background: allDone ? BRAND_GRADIENT : 'white',
                      border: `1.5px solid ${allDone ? 'transparent' : '#D1D5DB'}`,
                    }}
                  >
                    {allDone && (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <div className="text-left min-w-0">
                    <div className="text-[13px] font-semibold text-gray-800 truncate">
                      {allDone
                        ? 'All acknowledgments accepted'
                        : `Accept all ${CONSENTS.length} acknowledgments`}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {allDone
                        ? "You're good to bind."
                        : acceptedCount > 0
                          ? `${acceptedCount} of ${CONSENTS.length} accepted — tap to accept the rest.`
                          : 'Tap to accept all, or expand to review each.'}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTermsOpen(o => !o)}
                  aria-label={termsOpen ? 'Hide details' : 'Show details'}
                  className="px-3 flex items-center justify-center transition hover:bg-gray-50"
                  style={{ borderLeft: '1px solid #F3F4F6' }}
                >
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 transition-transform"
                    style={{ transform: termsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
              {termsOpen && (
                <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <div className="space-y-2.5">
                    {CONSENTS.map(c => (
                      <ConsentRow
                        key={c.key}
                        label={c.label}
                        checked={!!consents[c.key]}
                        onChange={(val) => setConsent(c.key, val)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* ============ PRICING ============ */}

        {/* Carrier + price + single proposal action */}
        <div className="rounded-xl p-6 text-center" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#5C2ED4' }}
            >
              {carrier}
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-4xl font-bold text-gray-900">{money(annualPremium)}</span>
            <span className="text-sm text-gray-400">/year</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
            style={{ color: '#5C2ED4' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <polyline points="9 14 12 17 15 14"/>
            </svg>
            Download Quote Proposal
          </button>
        </div>

          {/* Payment plan */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Payment Plan</div>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_PLANS.map(plan => {
                const active = frequency === plan.value
                const amt = plan.value === 'Annual' ? annualPremium : quote.monthly
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFrequency(plan.value)}
                    className="text-left rounded-lg px-4 py-3 transition relative"
                    style={{
                      background: active ? 'rgba(124,58,237,0.06)' : 'white',
                      border: `1.5px solid ${active ? '#7C3AED' : '#E5E7EB'}`,
                    }}
                  >
                    {active && (
                      <div
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{plan.label}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {money(amt)}<span className="text-[11px] font-normal text-gray-400 ml-0.5">/{plan.period}</span>
                    </div>
                    {plan.subtitle && (
                      <div className="text-[11px] text-gray-400 mt-0.5">{plan.subtitle}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fees */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-sm font-semibold text-gray-700 mb-2">Fees</div>
            <FieldRow label="BTIS Service Fee" value={money(btisServiceFee)} />
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                Broker Fee
                <input
                  type="text"
                  inputMode="numeric"
                  value={brokerFee}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '')
                    const n = v === '' ? 0 : Math.min(10000, Number(v))
                    setBrokerFee(n)
                  }}
                  className="rounded px-2 py-1 text-sm w-16 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/40 transition"
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                />
              </span>
              <span className="text-gray-800 font-medium">{money(brokerFeeNum)}</span>
            </div>
            <div className="border-t mt-2 pt-2" style={{ borderColor: '#E5E7EB' }}>
              <FieldRow label="Total Fees" value={money(totalFees)} bold />
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
            <div className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</div>

            {/* Charged to your card (fees) */}
            <div className="mb-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[12px] font-bold uppercase tracking-wider"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Charged to Your Card
                </span>
                <span className="text-[11px] text-gray-400">One-time fees</span>
              </div>
              <FieldRow label="BTIS Service Fee" value={money(btisServiceFee)} />
              {brokerFeeNum > 0 && <FieldRow label="Broker Fee" value={money(brokerFeeNum)} />}
            </div>

            <div className="border-t my-3" style={{ borderColor: '#F3F4F6' }} />

            {/* Premium breakdown */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-[12px] font-bold uppercase tracking-wider"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {carrier} {carrier === 'Coterie' ? 'Gold ' : ''}Premium Breakdown
                </span>
                <span className="text-[11px] text-gray-400">Charged to your card</span>
              </div>
              {isAnnual ? (
                <>
                  <FieldRow label="Base Premium (Annual)" value={money(quote.basePremium)} />
                  {quote.policyFee > 0 && <FieldRow label="Policy Fee" value={money(quote.policyFee)} />}
                  {quote.riskProgram > 0 && <FieldRow label="Manage My Risk Program" value={money2(quote.riskProgram)} />}
                </>
              ) : (
                <>
                  <FieldRow label="Base Premium (Monthly)" value={money(quote.monthly)} />
                  {installmentFee > 0 && <FieldRow label="Installment Fee" value={money(installmentFee)} />}
                </>
              )}
              <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: '#F3F4F6' }}>
                <FieldRow label={`Total ${carrier} Charge`} value={money(premiumPortion)} bold />
              </div>
            </div>

            <div className="border-t mt-4 pt-3 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
              <span className="text-sm font-bold text-gray-800">Due Today (Your Card)</span>
              <span className="text-xl font-bold text-gray-900">{money(dueToday)}</span>
            </div>
            <p className="text-[11px] italic text-gray-400 mt-2">
              These will appear as two separate charges on your card.
            </p>
          </div>

        {/* Insured Contact */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Insured Contact</div>
          <div className="space-y-4">
            <FormGrid>
              <Input label="First Name" value={contact.firstName} onChange={setContact('firstName')} placeholder="First name" />
              <Input label="Last Name"  value={contact.lastName}  onChange={setContact('lastName')}  placeholder="Last name" />
            </FormGrid>
            <Input label="Email" type="email" value={contact.email} onChange={setContact('email')} placeholder="name@company.com" />
          </div>
        </div>

        {/* Footer disclaimers */}
        <div className="space-y-2 text-[12px] text-gray-500 leading-relaxed">
          <p>
            Same-day bind requests must be received by 5 pm PST. We kindly ask you to review and consent to these
            transactions before proceeding.
          </p>
          <p>
            This card will be used for renewal. Contact <span style={{ color: '#5C2ED4' }}>bopbinds@btisinc.com</span> within
            15 days to change. Pricing is subject to changes due to rate and underwriting updates.
          </p>
          <p>
            Review {carrier}'s <a href="#" className="font-semibold hover:underline" style={{ color: '#5C2ED4' }}>terms &amp; conditions</a>.
          </p>
        </div>
      </div>

      {/* ============ DISCLOSURES & TERMS (full width) ============ */}
      <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <button
          type="button"
          onClick={() => setDisclosuresOpen(o => !o)}
          className="flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: '#5C2ED4' }}
        >
          <span>{disclosuresOpen ? '−' : '+'}</span>
          View Disclosures &amp; Terms
        </button>

        {disclosuresOpen && (
          <div className="mt-5 space-y-5 text-[13px] text-gray-600 leading-relaxed">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quote Notice</div>
              <p>
                This is not a final quote, nor is it an offer of insurance. Pricing is based only upon the rating
                information your agent has provided and may be subject to change due to additional rating variables.
                In addition, this is not a policy, but merely a general description of coverages available. Refer to
                actual policy for full coverage details including exclusions and limitations. Your policy will contain
                all of the terms and conditions applicable in the event of a loss or claim. Acceptability of this risk
                is dependent upon company underwriting review and will be subject to an engineering &amp; safety
                services survey, including compliance with recommendations made.
              </p>
            </div>

            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-gray-800 mb-2">
                Broker Fee, Service Fee &amp; Quotation Disclosure
              </div>
              <p>
                If indicated, Total Amount Due includes a Broker Fee for services that may include performing a risk
                analysis, comparing policies, processing submissions, communication expenses, searching the markets
                for the desired coverage, working with underwriters on the coverage proposal, and servicing the policy
                after issuance. If we are deemed to be a broker, we represent the insured and will represent you
                honestly and competently in placing the insurance. We will also receive commission from the insurer.
                Broker Fees on Admitted policies are fully earned and nonrefundable, except when applicable by law.
                Broker Fees may be applicable to renewal policies. The insured is not obligated to purchase the
                proposed insurance. If you need further information about this fee, the compensation arrangements,
                or the insurance company proposing to provide you insurance, please contact us.
              </p>
              <p className="mt-2 font-semibold text-gray-800">
                BTIS will impose a Service Fee of $75.00, separate from amounts charged by the insurer.
              </p>
            </div>

            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-gray-800 mb-2">Quotation Terms</div>
              <p>
                All quotations should be considered an estimate and are subject to change based on accurate
                underwriting information, changes in state rates, experience modifications, or any other items by
                jurisdictions that have control over such items. Final premium will be determined at the end of the
                policy period, after payrolls have been audited. This quotation is strictly conditioned upon no
                material change in the risk (including but not limited to claims and potential claims), between the
                date of this quotation and the inception date of the proposed policy. The insured is required to
                advise the potential Insurer of any changes immediately and prior to binding the coverage. In the
                event of such change in risk, the Insurer may in its sole discretion, whether or not this quotation
                has been already accepted by the Insured, modify and/or withdraw its quotation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bind button */}
      <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[11px] text-gray-400 max-w-md">
          By clicking Bind, you authorize the two charges shown above to be placed on the card on file. Your policy will be issued immediately.
        </p>
        <button
          type="button"
          onClick={() => setShowPayment(true)}
          disabled={!canBind}
          className="inline-flex items-center gap-3 pl-6 pr-5 py-3 rounded-xl text-white transition hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            background: canBind ? BRAND_GRADIENT : '#D1D5DB',
            boxShadow: canBind ? '0 4px 14px rgba(92,46,212,0.25)' : 'none',
          }}
        >
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">Bind Policy</span>
            <span className="text-[10.5px] font-medium opacity-90">
              Authorize 2 charges · {money(totalFees)} + {money(premiumPortion)}
            </span>
          </div>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>

      {/* Input 1 Payments modal */}
      <Input1Modal
        open={showPayment}
        amount={totalFees}
        onClose={() => setShowPayment(false)}
        onComplete={() => {
          setShowPayment(false)
          onBound && onBound({
            carrier,
            packageId: formData.bind?.packageId,
            premium: annualPremium,
            dueToday,
            totalFees,
            frequency,
          })
        }}
      />
    </div>
  )
}
