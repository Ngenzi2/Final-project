import { useState } from 'react'
import type { FormEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'
import type { CompanyFiles, CompanyRegisterInput } from '../api/companies'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  fileInputClass,
  inputClass,
  itemMetaClass,
  itemTitleClass,
  labelClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillPendingClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
  tableWrapClass,
  td,
  th,
} from '../constants/ui'

const emptyForm: CompanyRegisterInput = {
  name: '',
  registrationNumber: '',
  tin: '',
  email: '',
  phone: '',
  address: '',
  district: '',
  adminFullName: '',
  adminNationalId: '',
  adminPhone: '',
  adminEmail: '',
  adminPosition: '',
  adminPassword: '',
}

type CompanyFileKey = keyof CompanyFiles

const stepMeta = [
  { title: 'Basic information', description: 'Company identity & contact details' },
  { title: 'Legal documents', description: 'Certificates, license, logo' },
  { title: 'Administrator', description: 'Who manages this company' },
  { title: 'Review & submit', description: 'Confirm before registering' },
] as const

const CompaniesPage = () => {
  const { companies, loading, error, register, approve } = useCompanies()
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState<CompanyFiles>({})
  const [step, setStep] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isStepValid = (stepIndex: number) => {
    if (stepIndex === 0) return form.name.trim() !== '' && form.registrationNumber.trim() !== '' && form.email.trim() !== ''
    if (stepIndex === 2) return form.adminFullName.trim() !== '' && form.adminEmail.trim() !== '' && form.adminPassword.trim() !== ''
    return true
  }

  const goToStep = (target: number) => {
    if (target < step || isStepValid(step)) {
      setStep(Math.max(0, Math.min(target, stepMeta.length - 1)))
    }
  }

  const onFile = (key: CompanyFileKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((current) => ({ ...current, [key]: event.target.files?.[0] }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    if (!isStepValid(0) || !isStepValid(2)) return
    setSubmitting(true)
    try {
      await register(form, files)
      setForm(emptyForm)
      setFiles({})
      setStep(0)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to register company.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`${panelClass} grid gap-6`}>
      <div className="mb-1">
        <h2 className={sectionHeaderTitleClass}>Company management</h2>
        <p className={sectionHeaderTextClass}>
          Register driving companies with full legal and administrator details, then review and approve them.
        </p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-8 max-[940px]:grid-cols-1">
        <div className="flex flex-row max-[940px]:overflow-x-auto min-[941px]:flex-col">
          {stepMeta.map((meta, index) => (
            <button key={meta.title} type="button" onClick={() => goToStep(index)} className="flex items-start gap-3 text-left min-[941px]:py-2">
              <span className="flex flex-col items-center min-[941px]:h-full">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    index < step ? 'bg-brand-orange-strong text-white' : index === step ? 'bg-brand-navy text-white' : 'bg-[#e6e8f0] text-[#6c6f93]'
                  }`}
                >
                  {index < step ? '✓' : index + 1}
                </span>
                {index < stepMeta.length - 1 && <span className="my-1 min-h-6 w-px flex-1 bg-[#e6e8f0] max-[940px]:hidden" />}
              </span>
              <span className="pb-4 max-[940px]:whitespace-nowrap">
                <span className={`block text-[0.92rem] font-bold ${index === step ? 'text-brand-navy' : 'text-[#3d415f]'}`}>{meta.title}</span>
                <span className="block text-[0.8rem] text-[#6c6f93] max-[940px]:hidden">{meta.description}</span>
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {step === 0 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#141a39]">Basic information</h3>
              <div className="grid grid-cols-3 gap-4 max-[940px]:grid-cols-1">
                <label className={labelClass}>
                  Company name
                  <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className={labelClass}>
                  Registration number
                  <input
                    className={inputClass}
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  TIN
                  <input className={inputClass} value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} />
                </label>
                <label className={labelClass}>
                  Email
                  <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
                <label className={labelClass}>
                  Phone
                  <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label className={labelClass}>
                  District
                  <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </label>
                <label className={`${labelClass} col-span-3 max-[940px]:col-span-1`}>
                  Address
                  <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#141a39]">Legal documents</h3>
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                {(
                  [
                    ['registrationCertificate', 'Registration certificate'],
                    ['drivingSchoolLicense', 'Driving school license'],
                    ['taxCertificate', 'Tax certificate'],
                    ['logo', 'Company logo'],
                  ] as [CompanyFileKey, string][]
                ).map(([key, label]) => (
                  <label key={key} className={labelClass}>
                    {label}
                    <input type="file" className={fileInputClass} onChange={onFile(key)} />
                    {files[key] && (
                      <span className="flex items-center gap-1.5 text-[0.8rem] text-brand-orange-strong">
                        <UploadCloud size={14} /> {files[key]?.name}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#141a39]">Company administrator information</h3>
              <p className={itemMetaClass}>This creates the login account the company will use to sign in.</p>
              <div className="grid grid-cols-3 gap-4 max-[940px]:grid-cols-1">
                <label className={labelClass}>
                  Full name
                  <input className={inputClass} value={form.adminFullName} onChange={(e) => setForm({ ...form, adminFullName: e.target.value })} />
                </label>
                <label className={labelClass}>
                  National ID
                  <input
                    className={inputClass}
                    value={form.adminNationalId}
                    onChange={(e) => setForm({ ...form, adminNationalId: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Position
                  <input className={inputClass} value={form.adminPosition} onChange={(e) => setForm({ ...form, adminPosition: e.target.value })} />
                </label>
                <label className={labelClass}>
                  Phone
                  <input className={inputClass} value={form.adminPhone} onChange={(e) => setForm({ ...form, adminPhone: e.target.value })} />
                </label>
                <label className={labelClass}>
                  Login email
                  <input
                    type="email"
                    className={inputClass}
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Login password
                  <input
                    type="password"
                    className={inputClass}
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#141a39]">Review &amp; submit</h3>
              <div className={listCardClass}>
                <div className={listItemClass}>
                  <div>
                    <p className={itemTitleClass}>{form.name || 'Untitled company'}</p>
                    <p className={itemMetaClass}>
                      {form.registrationNumber || 'No registration number'} · {form.tin || 'No TIN'}
                    </p>
                    <p className={itemMetaClass}>
                      {form.email || 'No email'} · {form.phone || 'No phone'}
                    </p>
                  </div>
                </div>
                <div className={listItemClass}>
                  <div>
                    <p className={itemTitleClass}>Administrator</p>
                    <p className={itemMetaClass}>
                      {form.adminFullName || 'Not provided'} · {form.adminPosition || 'No position'}
                    </p>
                    <p className={itemMetaClass}>{form.adminEmail || 'No login email'}</p>
                  </div>
                </div>
              </div>
              {submitError && <ErrorState message={submitError} />}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              disabled={step === 0}
              className="cursor-pointer rounded-2xl border border-[#d7d8e5] bg-white px-4.5 py-3 text-[#3d415f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            {step < stepMeta.length - 1 ? (
              <button type="button" onClick={() => goToStep(step + 1)} disabled={!isStepValid(step)} className={primaryButtonClass}>
                Next
              </button>
            ) : (
              <button type="submit" disabled={submitting} className={primaryButtonClass}>
                {submitting ? 'Registering...' : 'Register company'}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-2 grid gap-4">
        <h3 className="m-0 text-[1.05rem] text-[#141a39]">Registered companies</h3>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className={tableWrapClass}>
            <table className="w-full min-w-175 border-collapse text-left">
              <thead>
                <tr>
                  <th className={th}>Company</th>
                  <th className={th}>Reg. number / TIN</th>
                  <th className={th}>District</th>
                  <th className={th}>Administrator</th>
                  <th className={th}>Status</th>
                  <th className={th}>Registered / Approved</th>
                  <th className={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className={td}>
                      <p className={itemTitleClass}>{company.name}</p>
                      <p className={itemMetaClass}>{company.email}</p>
                    </td>
                    <td className={td}>
                      <p className="m-0">{company.registrationNumber || '—'}</p>
                      <p className={itemMetaClass}>{company.tin || '—'}</p>
                    </td>
                    <td className={td}>{company.district || '—'}</td>
                    <td className={td}>
                      <p className="m-0">{company.admin.fullName || '—'}</p>
                      <p className={itemMetaClass}>{company.admin.position || '—'}</p>
                    </td>
                    <td className={td}>
                      <span className={company.approved ? pillApprovedClass : pillPendingClass}>
                        {company.approved ? 'Approved' : 'Pending approval'}
                      </span>
                    </td>
                    <td className={td}>
                      <p className="m-0">{company.registrationDate}</p>
                      <p className={itemMetaClass}>{company.approvalDate ?? 'Not yet approved'}</p>
                    </td>
                    <td className={td}>
                      {!company.approved && (
                        <button type="button" onClick={() => approve(company.id)} className={smallButtonClass}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default CompaniesPage
