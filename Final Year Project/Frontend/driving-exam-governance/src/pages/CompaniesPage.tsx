import { useState } from 'react'
import type { FormEvent } from 'react'
import { UploadCloud, Eye, EyeOff, Trash2, Power, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../components/Modal'
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
  pillDangerClass,
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
  const { companies, loading, error, register, approve, suspend, unsuspend, remove, update } = useCompanies()
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState<CompanyFiles>({})
  const [step, setStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'suspend' | 'unsuspend' | 'delete', id: number, name: string } | null>(null)
  const [editModal, setEditModal] = useState<{ id: number, email: string, phone: string, address: string, district: string } | null>(null)

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

    // Prevent direct submission and only advance if the current step is filled
    if (step < stepMeta.length - 1) {
      if (isStepValid(step)) {
        goToStep(step + 1)
      }
      return
    }

    if (!isStepValid(0) || !isStepValid(2)) return
    setSubmitting(true)

    const promise = register(form, files)
    toast.promise(promise, {
      loading: 'Registering company...',
      success: 'Company approval requested successfully.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to register company.'),
    })

    try {
      await promise
      setForm(emptyForm)
      setFiles({})
      setStep(0)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to register company.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async () => {
    if (!actionModal) return
    const promise = actionModal.type === 'approve'
      ? approve(actionModal.id)
      : actionModal.type === 'suspend'
        ? suspend(actionModal.id)
        : actionModal.type === 'unsuspend'
          ? unsuspend(actionModal.id)
          : remove(actionModal.id)

    toast.promise(promise, {
      loading: `Processing...`,
      success: `Company ${actionModal.type === 'approve' ? 'approved' : actionModal.type === 'suspend' ? 'suspended' : actionModal.type === 'unsuspend' ? 'unsuspended' : 'deleted'} successfully.`,
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to execute action.'),
    })

    try {
      await promise
      setActionModal(null)
    } catch {
      // toast will handle error display
    }
  }

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editModal) return

    const promise = update(editModal.id, {
      email: editModal.email,
      phone: editModal.phone,
      address: editModal.address,
      district: editModal.district,
    })

    toast.promise(promise, {
      loading: 'Updating company...',
      success: 'Company updated successfully.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to update company.'),
    })

    try {
      await promise
      setEditModal(null)
    } catch {
      // handled by toast
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
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${index < step ? 'bg-brand-orange-strong text-white' : index === step ? 'bg-brand-navy text-white' : 'bg-[#E5EAF2] text-[#6B7280]'
                    }`}
                >
                  {index < step ? '✓' : index + 1}
                </span>
                {index < stepMeta.length - 1 && <span className="my-1 min-h-6 w-px flex-1 bg-[#E5EAF2] max-[940px]:hidden" />}
              </span>
              <span className="pb-4 max-[940px]:whitespace-nowrap">
                <span className={`block text-[0.92rem] font-bold ${index === step ? 'text-brand-navy' : 'text-[#6B7280]'}`}>{meta.title}</span>
                <span className="block text-[0.8rem] text-[#6B7280] max-[940px]:hidden">{meta.description}</span>
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {step === 0 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#1F2937]">Basic information</h3>
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
              <h3 className="m-0 text-[1.05rem] text-[#1F2937]">Legal documents</h3>
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
              <h3 className="m-0 text-[1.05rem] text-[#1F2937]">Company administrator information</h3>
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
                  Login email / Username
                  <input
                    type="text"
                    className={inputClass}
                    value={form.adminEmail}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Login password
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={inputClass}
                      value={form.adminPassword}
                      onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent p-0 cursor-pointer flex items-center justify-center"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h3 className="m-0 text-[1.05rem] text-[#1F2937]">Review &amp; submit</h3>
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
              className="cursor-pointer rounded-2xl border border-[#E5EAF2] bg-white px-4.5 py-3 text-[#6B7280] disabled:cursor-not-allowed disabled:opacity-40"
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
        <h3 className="m-0 text-[1.05rem] text-[#1F2937]">Registered companies</h3>
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
                      <span className={company.suspended ? pillDangerClass : company.approved ? pillApprovedClass : pillPendingClass}>
                        {company.suspended ? 'Suspended' : company.approved ? 'Approved' : 'Pending approval'}
                      </span>
                    </td>
                    <td className={td}>
                      <p className="m-0">{company.registrationDate}</p>
                      <p className={itemMetaClass}>{company.approvalDate ?? 'Not yet approved'}</p>
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        {!company.approved && !company.suspended ? (
                          <button type="button" onClick={() => setActionModal({ type: 'approve', id: company.id, name: company.name })} className={smallButtonClass}>
                            Approve
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditModal({ id: company.id, email: company.email, phone: company.phone, address: company.address, district: company.district })}
                              className="text-brand-navy cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border-none bg-brand-navy/10 hover:bg-brand-navy/20"
                              title="Edit company properties"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionModal({ type: company.suspended ? 'unsuspend' : 'suspend', id: company.id, name: company.name })}
                              className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border-none ${company.suspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30'}`}
                              title={company.suspended ? 'Unsuspend company' : 'Suspend company'}
                            >
                              <Power size={16} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setActionModal({ type: 'delete', id: company.id, name: company.name })}
                          className="text-red-500 cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border-none bg-red-50 hover:bg-red-100"
                          title="Delete company"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? 'Approve Company' : actionModal?.type === 'suspend' ? 'Suspend Company' : actionModal?.type === 'delete' ? 'Delete Company' : 'Unsuspend Company'}
      >
        <div className="grid gap-5">
          <p className="m-0 text-[#6B7280]">
            Are you sure you want to {actionModal?.type} <strong>{actionModal?.name}</strong>?
            {actionModal?.type === 'suspend' && ' They will no longer be able to schedule exams or register teachers.'}
            {actionModal?.type === 'unsuspend' && ' Their access will be fully restored.'}
            {actionModal?.type === 'delete' && ' This action cannot be undone and deletes all associated records.'}
          </p>
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setActionModal(null)}
              className="rounded-full bg-slate-100 px-5 py-2.5 text-[0.95rem] font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              className={`rounded-full px-5 py-2.5 text-[0.95rem] font-semibold text-white ${actionModal?.type === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-navy hover:bg-[#0f1b2d]'}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Company Details"
      >
        <form onSubmit={handleEditSubmit} className="grid gap-4">
          <label className={labelClass}>
            Company Email
            <input
              type="email"
              className={inputClass}
              value={editModal?.email ?? ''}
              onChange={(e) => setEditModal(curr => curr ? { ...curr, email: e.target.value } : null)}
              required
            />
          </label>
          <label className={labelClass}>
            Phone Number
            <input
              className={inputClass}
              value={editModal?.phone ?? ''}
              onChange={(e) => setEditModal(curr => curr ? { ...curr, phone: e.target.value } : null)}
            />
          </label>
          <label className={labelClass}>
            District
            <input
              className={inputClass}
              value={editModal?.district ?? ''}
              onChange={(e) => setEditModal(curr => curr ? { ...curr, district: e.target.value } : null)}
            />
          </label>
          <label className={labelClass}>
            Address
            <input
              className={inputClass}
              value={editModal?.address ?? ''}
              onChange={(e) => setEditModal(curr => curr ? { ...curr, address: e.target.value } : null)}
            />
          </label>
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setEditModal(null)}
              className="cursor-pointer rounded-2xl border border-[#E5EAF2] bg-white px-4.5 py-3 text-[#6B7280]"
            >
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default CompaniesPage
