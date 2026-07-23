import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserPlus, Power, Trash2, Copy, Check, ShieldCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../components/Modal'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { useOfficerAccounts } from '../hooks/useOfficerAccounts'
import { ApiError } from '../api/client'
import type { OfficerCreated } from '../api/officerAccounts'
import {
  formGridClass,
  inputClass,
  itemMetaClass,
  itemTitleClass,
  labelClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillNeutralClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const emptyForm = { name: '', email: '' }

const UserManagementPage = () => {
  const { officers, loading, error, create, setActive, remove } = useOfficerAccounts()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<OfficerCreated | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ id: number, name: string } | null>(null)

  const closeAddModal = () => {
    setAddModalOpen(false)
    setForm(emptyForm)
    setFormError('')
    setCreated(null)
    setCopied(false)
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.email.trim()) return
    setSubmitting(true)

    try {
      const result = await create({ name: form.name.trim(), email: form.email.trim() })
      setCreated(result)
      toast.success('Exam officer created', { description: `${result.name} can now sign in.` })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create exam officer.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyPassword = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleActive = (id: number, enabled: boolean) => {
    const promise = setActive(id, !enabled)
    toast.promise(promise, {
      loading: enabled ? 'Disabling officer...' : 'Enabling officer...',
      success: enabled ? 'Officer disabled.' : 'Officer enabled.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to update officer status.'),
    })
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    const promise = remove(deleteModal.id)
    toast.promise(promise, {
      loading: `Removing ${deleteModal.name}...`,
      success: `${deleteModal.name} removed successfully.`,
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to remove officer.'),
    })

    try {
      await promise
      setDeleteModal(null)
    } catch {
      // toast.promise already surfaced the error above
    }
  }

  return (
    <div className={panelClass}>
      <div className="mb-5.5 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
        <div>
          <h2 className={sectionHeaderTitleClass}>User Management</h2>
          <p className={sectionHeaderTextClass}>Create and manage Exam Officer accounts for on-site verification staff.</p>
        </div>
        <button type="button" onClick={() => setAddModalOpen(true)} className={`${primaryButtonClass} flex items-center gap-2`}>
          <UserPlus size={18} /> Add Exam Officer
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading officer accounts..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : officers.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No exam officers yet" description="Add your first exam officer to enable on-site QR verification." />
      ) : (
        <div className={listCardClass}>
          {officers.map((officer) => (
            <div key={officer.id} className={`${listItemClass} flex items-center justify-between`}>
              <div>
                <p className={itemTitleClass}>{officer.name}</p>
                <p className={itemMetaClass}>
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} /> {officer.email}
                  </span>
                  <span>Added {new Date(officer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={officer.enabled ? pillApprovedClass : pillNeutralClass}>
                  {officer.enabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(officer.id, officer.enabled)}
                  title={officer.enabled ? 'Disable officer' : 'Enable officer'}
                  className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none transition-colors ${
                    officer.enabled ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  <Power size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ id: officer.id, name: officer.name })}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={addModalOpen} onClose={closeAddModal} title={created ? 'Exam Officer Created' : 'Add Exam Officer'}>
        {created ? (
          <div className="grid gap-5">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <ShieldCheck className="text-emerald-600 shrink-0" size={22} />
              <p className="m-0 text-sm text-emerald-800">
                <strong>{created.name}</strong> can now sign in with the email below. A copy of these credentials was also emailed to them.
              </p>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
                <div className="text-sm font-semibold text-slate-800">{created.email}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Temporary password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-800">
                    {created.temporaryPassword}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                    title="Copy password"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <p className="m-0 text-xs text-slate-400">This password is shown only once. The officer should change it after signing in.</p>
            <button type="button" onClick={closeAddModal} className={`${primaryButtonClass} w-fit`}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className={formGridClass}>
            <label className={labelClass}>
              Officer name
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter officer's full name" autoFocus />
            </label>
            <label className={labelClass}>
              Email address
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="officer@examgov.rw"
              />
            </label>
            {formError && <ErrorState message={formError} />}
            <button type="submit" disabled={submitting} className={primaryButtonClass}>
              {submitting ? 'Creating...' : 'Create officer account'}
            </button>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Exam Officer">
        <div className="grid gap-5">
          <p className="m-0 text-[#6B7280]">
            Are you sure you want to remove <strong>{deleteModal?.name}</strong>? They will no longer be able to sign in.
          </p>
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setDeleteModal(null)}
              className="rounded-full bg-slate-100 px-5 py-2.5 text-[0.95rem] font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-5 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-red-700"
            >
              Confirm Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagementPage
