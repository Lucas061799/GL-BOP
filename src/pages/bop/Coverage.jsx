import { Input, Select, FormGrid } from '../../components/FormField'

const GL_LIMIT_OPTIONS = [
  { value: 300000, label: '$300,000' },
  { value: 500000, label: '$500,000' },
  { value: 1000000, label: '$1,000,000' },
  { value: 2000000, label: '$2,000,000' },
]

const DEFAULTS = { glLimit: 1000000 }

function FieldGroup({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-2.5 pl-0.5">
        {label}
      </div>
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Coverage({ formData, updateFormData }) {
  const data = formData.coverage || {}
  const set = (key) => (val) => updateFormData('coverage', { [key]: val })

  const glLimit = data.glLimit ?? DEFAULTS.glLimit
  const aggregate = glLimit * 2

  return (
    <div className="w-full space-y-6">
      <p className="text-sm text-gray-500 -mt-2">
        Choose your coverage limits.
      </p>

      <FieldGroup label="Liability Coverage">
        <FormGrid>
          <Select label="General Liability — Per Occurrence" required options={GL_LIMIT_OPTIONS} value={glLimit} onChange={set('glLimit')} />
          <Input label="General Liability — Aggregate" value={`$${aggregate.toLocaleString()} (auto: 2× per occurrence)`} onChange={() => {}} className="opacity-70" />
        </FormGrid>
      </FieldGroup>
    </div>
  )
}
