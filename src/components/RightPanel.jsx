import { useState, useRef } from 'react'

function getSectionCompletion(formData) {
  const results = {}
  const a = formData.applicant || {}
  results[1] = !!(a.namedInsured && a.entity && a.effectiveDate && a.email && a.phone)
  const vs = formData.vehicles?.vehicles || []
  results[2] = vs.length > 0 && vs.every(v => v.year && v.make && v.model)
  const ds = formData.drivers?.drivers || []
  results[3] = ds.length > 0 && ds.every(d => d.firstName && d.lastName)
  const e = formData.eligibility || {}
  results[4] = Object.keys(e).length >= 7
  const c = formData.coverage || {}
  results[5] = !!(c.liabilityLimit)
  results[6] = formData.additionalInsured?.hasAdditional !== undefined
  results[7] = formData.lossPayee?.hasPayee !== undefined
  results[8] = formData.priorHistory?.hasCurrent !== undefined
  results[9] = formData.claims?.hasClaims !== undefined
  results[10] = !!(formData.payment?.planDuration)
  return results
}

export default function RightPanel({ onFormReview, formData = {}, pulseUpload = false, isDark = false }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const completion = getSectionCompletion(formData)
  const completedCount = Object.values(completion).filter(Boolean).length
  const progressPct = Math.round((completedCount / 10) * 100)

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
        <h2 className="text-lg font-bold mb-3" style={{ color: isDark ? '#F9FAFB' : undefined }}>Submission in Progress</h2>

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
            style={{ width: `${progressPct}%`, background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}
          />
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6'}` }} />

        {/* Upload & Save Time */}
        <div className={`mb-4 rounded-2xl overflow-hidden transition-all ${pulseUpload ? 'upload-pulse' : ''}`} style={{ border: isDark ? '1px solid rgba(92,46,212,0.25)' : '1px solid #E5E7EB', background: isDark ? 'rgba(92,46,212,0.12)' : 'white' }}>
          <div className="px-4 pt-4 pb-4">
            <h3 className="text-base font-bold text-navy leading-tight mb-0.5">Upload & Save Time!</h3>
            <div className="flex items-center gap-1.5 mb-3">
              <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Competitor quote or ACORD form?</p>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold" style={{ background: '#73C9B7' }}>i</div>
            </div>

            {/* Drop zone wraps everything — dashed border = drag affordance */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              className={`rounded-xl border-2 border-dashed transition-all px-3 pt-3 pb-3 ${dragging ? 'border-[#5C2ED4] bg-[#5C2ED4]/5' : 'border-[#A614C3]/25'}`}
            >
              <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.png" className="hidden" onChange={e => addFiles(e.target.files)} />

              {/* Hint text above button */}
              <p className="text-center text-[10px] text-gray-400 mb-2">
                Drop a file or <span className="font-semibold text-gray-500">drag &amp; drop</span> · PDF, JPG, PNG · Max 10MB
              </p>

              {/* Upload button */}
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}
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
