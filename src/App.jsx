import { useState, useRef, useEffect, useCallback } from 'react'
import norbielinkLogo from './assets/norbielink-logo.png'
import norbielinkLogoDark from './assets/norbielink-logo-dark.png'
import btisLogo from './assets/btislogo.png'
import btisLogoDark from './assets/btislogo-dark.png'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import ApplicantInformation from './pages/ApplicantInformation'
import VehicleInformation from './pages/VehicleInformation'
import DriverInformation from './pages/DriverInformation'
import EligibilityInformation from './pages/EligibilityInformation'
import CoverageInformation from './pages/CoverageInformation'
import AdditionalInsured from './pages/AdditionalInsured'
import LossPayee from './pages/LossPayee'
import PriorHistory from './pages/PriorHistory'
import ClaimHistory from './pages/ClaimHistory'
import PaymentPlan from './pages/PaymentPlan'
import Submission from './pages/Submission'
import PageZero from './pages/PageZero'

const STEPS = [
  { id: 1, label: 'Applicant',          key: 'applicant' },
  { id: 2, label: 'Vehicles',           key: 'vehicles' },
  { id: 3, label: 'Driver',             key: 'driver' },
  { id: 4, label: 'Eligibility',        key: 'eligibility' },
  { id: 5, label: 'Coverage',           key: 'coverage' },
  { id: 6, label: 'Additional Insured', key: 'additionalInsured' },
  { id: 7, label: 'Loss Payee',         key: 'lossPayee' },
  { id: 8, label: 'Prior History',      key: 'priorHistory' },
  { id: 9, label: 'Claims',             key: 'claims' },
  { id: 10, label: 'Payment Plan',      key: 'paymentPlan' },
]

const FILE_ICONS = {
  pdf: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="url(#fileG)" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13 3v5a1 1 0 001 1h5M9 13h6M9 17h4" stroke="url(#fileG)" strokeWidth="1.6" strokeLinecap="round"/>
      <defs>
        <linearGradient id="fileG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  img: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="url(#fileG2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="fileG2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
        </linearGradient>
      </defs>
    </svg>
  ),
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadPopup({ onDismiss }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const addFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return
    const incoming = Array.from(fileList)
    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const merged = [...prev, ...incoming.filter(f => !existingNames.has(f.name))]
      return merged
    })
  }

  const removeFile = (name) => setSelectedFiles(prev => prev.filter(f => f.name !== name))

  const hasFiles = selectedFiles.length > 0

  const btnLabel = hasFiles
    ? selectedFiles.length === 1
      ? `Upload & Continue — ${selectedFiles[0].name}`
      : `Upload & Continue — ${selectedFiles.length} files`
    : 'Upload & Continue'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,10,40,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{
          width: '460px',
          background: '#ffffff',
          border: '1px solid rgba(92,46,212,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(92,46,212,0.07)', color: '#5C2ED4' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(92,46,212,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(92,46,212,0.07)'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="px-7 pt-5 pb-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(92,46,212,0.07)', border: '1px solid rgba(92,46,212,0.12)' }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="url(#boltG)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="boltG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[11px] font-bold text-gradient tracking-wide">INSTANT FORM PARSING</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-navy mb-1.5 leading-tight">Upload &amp; Skip the Typing</h2>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Have a competitor quote or ACORD form? Drop it here — we'll pre-fill your submission automatically.
          </p>

          {/* Drop zone */}
          <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.png" className="hidden"
            onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
            style={{
              padding: hasFiles ? '14px 0' : '28px 0',
              borderColor: dragging ? '#5C2ED4' : 'rgba(92,46,212,0.2)',
              background: dragging ? 'rgba(92,46,212,0.04)' : 'rgba(248,246,255,0.6)',
              marginBottom: hasFiles ? '10px' : '16px',
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(92,46,212,0.08)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  stroke="url(#clipG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="clipG" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {hasFiles
              ? <p className="text-xs text-gray-400">or <span className="text-gradient font-semibold">add more files</span></p>
              : <>
                  <p className="text-sm font-semibold text-navy">Drop your file here</p>
                  <p className="text-xs text-gray-400">or <span className="text-gradient font-semibold">click to browse</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG · Max 10MB</p>
                </>
            }
          </div>

          {/* File list */}
          {hasFiles && (
            <div className="space-y-2 mb-4">
              {selectedFiles.map(file => {
                const ext = file.name.split('.').pop().toLowerCase()
                const icon = ext === 'pdf' ? FILE_ICONS.pdf : FILE_ICONS.img
                return (
                  <div key={file.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(248,246,255,0.7)', borderColor: 'rgba(92,46,212,0.12)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(92,46,212,0.08)' }}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-navy truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeFile(file.name) }}
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition"
                      style={{ background: 'rgba(92,46,212,0.07)', color: '#A614C3' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(166,20,195,0.15)'}
                      onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(92,46,212,0.07)'}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload CTA button */}
          <button
            disabled={!hasFiles}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mb-4 truncate px-4"
            style={hasFiles
              ? { background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)', boxShadow: '0 4px 16px rgba(92,46,212,0.3)', cursor: 'pointer' }
              : { background: '#D1D5DB', cursor: 'not-allowed' }
            }
          >
            {btnLabel}
          </button>

          {/* Dismiss */}
          <div className="text-center">
            <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 transition">
              Maybe later — I'll fill it in manually
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  // URL param shortcuts for Builder.io / Figma import
  // ?page=main → skip PageZero
  // ?page=submission → go straight to submission
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page')

  const [formData, setFormData] = useState({})
  const [activeStep, setActiveStep] = useState(1)
  const [submitted, setSubmitted] = useState(pageParam === 'submission')
  const [pageZeroDone, setPageZeroDone] = useState(pageParam === 'main' || pageParam === 'submission')
  const [darkMode, setDarkMode] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  useEffect(() => {
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false')
  }, [darkMode])
  const [pulseUpload, setPulseUpload] = useState(false)
  const [errorFields, setErrorFields] = useState([])
  const sectionRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const isScrollingToRef = useRef(false)

  const updateFormData = (section, data) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
    // Clear errors for updated fields
    if (errorFields.length > 0) setErrorFields([])
  }

  const goToStep = useCallback((stepId) => {
    if (stepId === 11) {
      setSubmitted(true)
      return
    }
    const el = sectionRefs.current[stepId]
    if (!el || !scrollContainerRef.current) return
    isScrollingToRef.current = true
    setActiveStep(stepId)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => { isScrollingToRef.current = false }, 800)
  }, [])

  // Check errors: find all required empty fields and scroll to first
  const handleCheckErrors = useCallback(() => {
    const errors = []

    const a = formData.applicant || {}
    if (!a.namedInsured) errors.push({ section: 1, field: 'applicant-namedInsured' })
    if (!a.entity) errors.push({ section: 1, field: 'applicant-entity' })
    if (!a.effectiveDate) errors.push({ section: 1, field: 'applicant-effectiveDate' })
    if (!a.email) errors.push({ section: 1, field: 'applicant-email' })
    if (!a.phone) errors.push({ section: 1, field: 'applicant-phone' })

    const vs = formData.vehicles?.vehicles || []
    if (vs.length === 0) errors.push({ section: 2, field: 'vehicles' })

    const ds = formData.drivers?.drivers || []
    if (ds.length === 0) errors.push({ section: 3, field: 'drivers' })

    const c = formData.coverage || {}
    if (!c.liabilityLimit) errors.push({ section: 5, field: 'coverage-liabilityLimit' })

    if (!formData.payment?.plan) errors.push({ section: 10, field: 'payment-plan' })

    setErrorFields(errors.map(e => e.field))

    if (errors.length > 0) {
      // Scroll to first error section
      const firstSection = errors[0].section
      const el = sectionRefs.current[firstSection]
      if (el && scrollContainerRef.current) {
        isScrollingToRef.current = true
        setActiveStep(firstSection)
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => { isScrollingToRef.current = false }, 800)
      }
    }
  }, [formData])

  const handleMainScroll = useCallback(() => {
    if (isScrollingToRef.current) return
    const container = scrollContainerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const threshold = containerRect.height * 0.35
    let current = STEPS[0].id
    STEPS.forEach(step => {
      const el = sectionRefs.current[step.id]
      if (el) {
        const top = el.getBoundingClientRect().top - containerRect.top
        if (top <= threshold) current = step.id
      }
    })
    setActiveStep(current)
  }, [])


  if (!pageZeroDone) {
    return <PageZero onStart={(data) => { updateFormData('pageZero', data); setPageZeroDone(true) }} />
  }

  if (submitted) {
    return <Submission formData={formData} onBack={() => setSubmitted(false)} isDark={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
  }

  return (
    <div className="flex flex-col h-screen font-montserrat overflow-hidden" style={{ background: darkMode ? '#131629' : 'white' }}>
      {showUpload && (
        <UploadPopup onDismiss={() => { setShowUpload(false); setPulseUpload(true); setTimeout(() => setPulseUpload(false), 2500) }} />
      )}
      {/* Full-width top header */}
      <header
        className="flex items-center justify-between shrink-0 z-10"
        style={{
          height: '56px',
          background: darkMode ? '#191D35' : 'white',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F3F4F6',
        }}
      >
        {/* Left: logo — same width as sidebar, left-aligned with Commercial Auto below */}
        <div className="flex items-center h-full px-3 md:px-5 w-auto md:w-64 2xl:md:w-72 md:shrink-0">
          <button
            className="md:hidden mr-3 p-1.5 rounded-lg"
            style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <img src={darkMode ? norbielinkLogoDark : norbielinkLogo} alt="NorbieLink" className="h-8" />
        </div>
        {/* Right: powered by btis — pushed to far right */}
        <div className="flex items-center gap-2 px-8">
          <span className="text-xs text-gray-400 tracking-wide">POWERED BY</span>
          <img src={darkMode ? btisLogoDark : btisLogo} alt="btis" className="h-7" />
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        {/* Sidebar — drawer on mobile, normal on desktop */}
        <div className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ top: 0 }}>
          <Sidebar
            steps={STEPS}
            activeStep={activeStep}
            onStepClick={(id) => { goToStep(id); setMobileSidebarOpen(false) }}
            formData={formData}
            onCheckErrors={handleCheckErrors}
            showSubmission={submitted || false}
            isDark={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
          />
        </div>

        {/* Scrollable main content */}
        <main
          ref={scrollContainerRef}
          onScroll={handleMainScroll}
          className="flex-1 overflow-y-auto custom-scroll relative"
          style={{ background: darkMode ? '#131629' : 'white' }}
        >

          <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8">

            {/* Mobile-only upload + form review — matches RightPanel style exactly */}
            <div className="lg:hidden space-y-3">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: darkMode ? '1px solid rgba(92,46,212,0.25)' : '1px solid #E5E7EB',
                  background: darkMode ? 'rgba(92,46,212,0.12)' : 'white',
                }}
              >
                <div className="px-4 pt-4 pb-4">
                  <h3 className="text-base font-bold text-navy leading-tight mb-0.5">Upload &amp; Save Time!</h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <p className="text-[11px] text-gray-500 font-medium whitespace-nowrap">Competitor quote or ACORD form?</p>
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold" style={{ background: '#73C9B7' }}>i</div>
                  </div>
                  <div
                    onClick={() => setShowUpload(true)}
                    className="cursor-pointer rounded-xl border-2 border-dashed transition-all px-3 pt-3 pb-3"
                    style={{ borderColor: 'rgba(166,20,195,0.25)' }}
                  >
                    <p className="text-center text-[10px] text-gray-400 mb-2">
                      Drop a file or <span className="font-semibold text-gray-500">drag &amp; drop</span> · PDF, JPG, PNG · Max 10MB
                    </p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0.11%, #A614C3 63.8%)' }}
                    >
                      Upload Here
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Review button — same style as RightPanel */}
              <button
                onClick={handleCheckErrors}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition"
                style={{
                  color: darkMode ? '#D8B4FE' : '#A614C3',
                  border: darkMode ? '1px solid rgba(216,180,254,0.35)' : '1px solid rgba(166,20,195,0.3)',
                  background: darkMode ? 'rgba(167,139,250,0.08)' : 'white',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Form Review
              </button>
            </div>

            {[
              { id: 1, title: 'Applicant Information',  el: <ApplicantInformation formData={formData} updateFormData={updateFormData} errorFields={errorFields} /> },
              { id: 2, title: 'Vehicle Information',    el: <VehicleInformation formData={formData} updateFormData={updateFormData} errorFields={errorFields} /> },
              { id: 3, title: 'Driver Information',     el: <DriverInformation formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 4, title: 'Eligibility Information',el: <EligibilityInformation formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 5, title: 'Coverage Information',   el: <CoverageInformation formData={formData} updateFormData={updateFormData} errorFields={errorFields} isDark={darkMode} /> },
              { id: 6, title: 'Additional Insured',     el: <AdditionalInsured formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 7, title: 'Loss Payee Information', el: <LossPayee formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 8, title: 'Prior History',          el: <PriorHistory formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 9, title: 'Claim History',          el: <ClaimHistory formData={formData} updateFormData={updateFormData} isDark={darkMode} /> },
              { id: 10, title: 'Payment Plan',          el: <PaymentPlan formData={formData} updateFormData={updateFormData} onSubmit={async () => {
                setSubmitted(true)
                // Send confirmation email (fire-and-forget)
                const applicant = formData.applicant || {}
                if (applicant.email) {
                  try {
                    await fetch('/api/send-confirmation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: applicant.email,
                        firstName: applicant.namedInsured?.split(' ')[0],
                        namedInsured: applicant.namedInsured,
                        submissionId: 'CA0094894',
                        effectiveDate: applicant.effectiveDate,
                      }),
                    })
                  } catch (e) {
                    console.warn('Email send failed (non-blocking):', e)
                  }
                }
              }} errorFields={errorFields} isDark={darkMode} /> },
            ].map(section => (
              <section
                key={section.id}
                ref={el => sectionRefs.current[section.id] = el}
                id={`section-${section.id}`}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <SectionHeader title={section.title} isDark={darkMode} />
                <div className="px-4 md:px-10 pt-4 md:pt-5 pb-8 md:pb-10">
                  {section.el}
                </div>
              </section>
            ))}

            <div className="pb-8" />
          </div>
        </main>

        <div className="hidden lg:block">
          <RightPanel onFormReview={handleCheckErrors} formData={formData} pulseUpload={pulseUpload} isDark={darkMode} />
        </div>
      </div>
    </div>
  )
}

// Section header — sits at top of each card
function SectionHeader({ title, isDark }) {
  return (
    <div className="px-4 md:px-10 pt-6 md:pt-8 pb-0">
      <div
        className="flex items-center justify-between pb-3 md:pb-4"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D1D5DB'}` }}
      >
        <h2 className="text-base md:text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : undefined }} >{title}</h2>
      </div>
    </div>
  )
}

export default App
