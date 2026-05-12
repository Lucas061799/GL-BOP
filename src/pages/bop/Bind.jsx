import { useState, useMemo } from 'react'
import { Input, FormGrid, Checkbox } from '../../components/FormField'

const PAYMENT_PLANS = [
  { value: 'Annual',    label: 'Pay in Full', subtitle: 'One annual payment',  multiplier: 1,    period: 'yr' },
  { value: 'Monthly',   label: 'Monthly',     subtitle: '12 monthly payments',  multiplier: 1/12, period: 'mo' },
  { value: 'Quarterly', label: 'Quarterly',   subtitle: '4 payments per year',  multiplier: 1/4,  period: 'qtr' },
]

const SAMPLE_PREMIUMS = {
  Coterie:          { premium: 1248, policyFee: 25, installmentFee: 0 },
  Hiscox:           { premium: 1392, policyFee: 40, installmentFee: 0 },
  CNA:              { premium: 1518, policyFee: 50, installmentFee: 5 },
  'Great American': { premium: 1620, policyFee: 60, installmentFee: 0 },
}

const CONSENTS = [
  { key: 'app',   label: 'I confirm that all information provided is true, accurate, and complete to the best of my knowledge.' },
  { key: 'auth',  label: 'I authorize the insurer to obtain consumer reports, including credit and loss history.' },
  { key: 'esign', label: 'I agree to receive policy documents electronically and consent to electronic signatures.' },
]

const money = (n) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const moneyRound = (n) => '$' + Math.round(n).toLocaleString()

function FieldRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500" style={{ fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-gray-800" style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )
}

export default function Bind({ formData, updateFormData, onGoToStep }) {
  const carrier = formData.bind?.selectedCarrier
  const quote = SAMPLE_PREMIUMS[carrier] || SAMPLE_PREMIUMS.Coterie

  const [frequency, setFrequency] = useState('Annual')
  const [brokerFee, setBrokerFee] = useState(0)
  const [bound, setBound] = useState(false)

  const contact = formData.bindContact || {}
  const setContact = (id) => (val) => updateFormData('bindContact', { [id]: val })

  const consents = formData.bindConsents || {}
  const setConsent = (key, val) => updateFormData('bindConsents', { [key]: val })

  const card = formData.bindCard || {}
  const setCard = (id) => (val) => updateFormData('bindCard', { [id]: val })

  const btisServiceFee = 75
  const totalFees = btisServiceFee + (Number(brokerFee) || 0)
  const annualPremium = quote.premium + (quote.policyFee || 0)
  const planMultiplier = PAYMENT_PLANS.find(p => p.value === frequency)?.multiplier ?? 1
  const installmentFee = frequency !== 'Annual' ? (quote.installmentFee || 0) : 0
  const premiumPortion = (annualPremium * planMultiplier) + installmentFee
  const dueToday = totalFees + premiumPortion

  const allConsented = useMemo(() => CONSENTS.every(c => consents[c.key]), [consents])
  const contactReady = !!(contact.firstName && contact.lastName && contact.email && contact.phone)
  const cardReady = !!(card.number && card.expiry && card.cvc && card.zip)
  const canBind = allConsented && contactReady && cardReady && !bound

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

  if (bound) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(92,46,212,0.04) 0%, rgba(166,20,195,0.04) 100%)',
          border: '1px solid rgba(92,46,212,0.18)',
        }}
      >
        <div
          className="inline-flex w-14 h-14 items-center justify-center rounded-full mb-3"
          style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{
            background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Policy bound!
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          Your {carrier} policy is now in force. You'll receive a confirmation email shortly.
        </p>
        <p className="text-xs text-gray-500">Total charged: <span className="font-semibold text-gray-800">{money(dueToday)}</span></p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Carrier + Due Today */}
      <div className="rounded-lg p-5" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-800">{carrier}</span>
        </div>
        <div>
          <span
            className="text-4xl font-bold"
            style={{
              background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {money(dueToday)}
          </span>
          <span className="text-sm text-gray-500 ml-2">due today</span>
        </div>
      </div>

      {/* Payment plan */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">Payment Plan</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAYMENT_PLANS.map(plan => {
            const active = frequency === plan.value
            const planAmt = (annualPremium * plan.multiplier) + (plan.value !== 'Annual' ? (quote.installmentFee || 0) : 0)
            return (
              <button
                key={plan.value}
                type="button"
                onClick={() => setFrequency(plan.value)}
                className="text-left rounded-lg px-4 py-3 transition"
                style={{
                  background: active ? 'linear-gradient(88.09deg, rgba(92,46,212,0.06) 0%, rgba(166,20,195,0.06) 100%)' : 'white',
                  border: `1.5px solid ${active ? '#7C3AED' : '#E5E7EB'}`,
                }}
              >
                <div className="text-sm font-semibold text-gray-800 mb-0.5">{plan.label}</div>
                <div className="text-[11px] text-gray-500 mb-2">{plan.subtitle}</div>
                <div className="text-base font-bold" style={{ color: active ? '#5C2ED4' : '#1F2937' }}>
                  {moneyRound(planAmt)}<span className="text-[11px] font-normal text-gray-500 ml-0.5">/{plan.period}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Payment summary */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">Payment Summary</label>
        <div className="rounded-lg p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          <FieldRow label="BTIS Service Fee" value={money(btisServiceFee)} />
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-gray-500">Broker Fee <span className="text-[10px] italic text-gray-400 ml-1">(editable)</span></span>
            <div className="flex items-center gap-1 text-gray-800">
              <span>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={brokerFee}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  const n = v === '' ? 0 : Math.min(10000, Number(v))
                  setBrokerFee(n)
                }}
                className="rounded px-2 py-1 text-right text-sm w-20 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/40 transition"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
              />
            </div>
          </div>
          {totalFees > 0 && (
            <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: '#E5E7EB' }}>
              <FieldRow label="Total Fees" value={money(totalFees)} bold />
            </div>
          )}

          <div className="mt-3 mb-3 rounded-lg p-3" style={{ background: '#F9FAFB', border: '1px solid #EAEAEA' }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              {carrier} Premium Breakdown
            </div>
            <FieldRow label={`Base Premium (${frequency})`} value={moneyRound(quote.premium * planMultiplier)} />
            {quote.policyFee > 0 && <FieldRow label="Policy Fee" value={moneyRound(quote.policyFee * planMultiplier)} />}
            {installmentFee > 0 && <FieldRow label="Installment Fee" value={moneyRound(installmentFee)} />}
            <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: '#E5E7EB' }}>
              <FieldRow label={`Total ${carrier} Charge`} value={moneyRound(premiumPortion)} bold />
            </div>
          </div>

          <div className="border-t pt-2.5 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
            <span className="text-sm font-bold text-gray-800">Due Today (Your Card)</span>
            <span className="text-xl font-bold" style={{ color: '#5C2ED4' }}>{money(dueToday)}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">Insured Contact</label>
        <div className="space-y-4">
          <FormGrid>
            <Input label="First Name" required value={contact.firstName} onChange={setContact('firstName')} />
            <Input label="Last Name" required value={contact.lastName} onChange={setContact('lastName')} />
          </FormGrid>
          <FormGrid>
            <Input label="Email" required type="email" value={contact.email} onChange={setContact('email')} />
            <Input label="Phone" required type="tel" value={contact.phone} onChange={setContact('phone')} placeholder="(555) 000-0000" />
          </FormGrid>
        </div>
      </div>

      {/* Card */}
      <div>
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">Payment Card</label>
        <div className="space-y-4">
          <Input label="Card Number" required value={card.number} onChange={setCard('number')} placeholder="1234 5678 9012 3456" />
          <FormGrid cols={3}>
            <Input label="Expiry" required value={card.expiry} onChange={setCard('expiry')} placeholder="MM/YY" />
            <Input label="CVC" required value={card.cvc} onChange={setCard('cvc')} placeholder="123" />
            <Input label="Billing Zip" required value={card.zip} onChange={setCard('zip')} placeholder="12345" />
          </FormGrid>
        </div>
      </div>

      {/* Consents */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-[13px] font-semibold text-gray-600 tracking-wide">Confirmation</label>
          <button
            type="button"
            onClick={() => {
              const next = !allConsented
              CONSENTS.forEach(c => setConsent(c.key, next))
            }}
            className="text-xs font-semibold transition hover:underline"
            style={{
              background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {allConsented ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="space-y-2.5 rounded-lg p-4" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
          {CONSENTS.map(c => (
            <Checkbox
              key={c.key}
              label={c.label}
              checked={!!consents[c.key]}
              onChange={(val) => setConsent(c.key, val)}
            />
          ))}
        </div>
      </div>

      {/* Bind button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setBound(true)}
          disabled={!canBind}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed"
          style={{
            background: canBind
              ? 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)'
              : '#D1D5DB',
            boxShadow: canBind ? '0 4px 14px rgba(92,46,212,0.25)' : 'none',
          }}
        >
          Bind Policy · Charge {money(dueToday)}
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
        <p className="text-[11px] text-gray-400 mt-2">
          By clicking Bind, you authorize the charge above. Your policy will be issued immediately.
        </p>
      </div>
    </div>
  )
}
