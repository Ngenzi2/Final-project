import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { ApiError } from '../api/client'
import type { ExamSlotInput } from '../api/examSlots'
import { ErrorState } from './ErrorState'
import { formGridClass, inputClass, labelClass, primaryButtonClass } from '../constants/ui'

const emptyForm = { name: '', location: '', examDate: '', startTime: '', capacity: '30' }

type AddExamSlotFormProps = {
    onCreate: (input: ExamSlotInput) => Promise<void>
}

export const AddExamSlotForm = ({ onCreate }: AddExamSlotFormProps) => {
    const [form, setForm] = useState(emptyForm)
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError('')
        if (!form.name.trim() || !form.location.trim() || !form.examDate || !form.startTime) return
        setSubmitting(true)

        const promise = onCreate({
            name: form.name.trim(),
            location: form.location.trim(),
            examDate: form.examDate,
            startTime: form.startTime,
            capacity: Number(form.capacity) || 1,
        })

        toast.promise(promise, {
            loading: 'Adding exam slot...',
            success: 'Exam slot added successfully.',
            error: 'Failed to add exam slot.',
        })

        try {
            await promise
            setForm(emptyForm)
        } catch (err) {
            setFormError(err instanceof ApiError ? err.message : 'Failed to create exam slot.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={formGridClass}>
            <label className={labelClass}>
                Site name
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter exam site name" />
            </label>
            <label className={labelClass}>
                Location
                <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" />
            </label>
            <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>
                    Date
                    <input type="date" className={inputClass} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
                </label>
                <label className={labelClass}>
                    Time
                    <input type="time" className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </label>
            </div>
            <label className={labelClass}>
                Capacity
                <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
            </label>
            {formError && <ErrorState message={formError} />}
            <button
                type="submit"
                disabled={submitting}
                className={`${primaryButtonClass} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(180,83,9,0.25)] active:translate-y-0 active:scale-[0.98]`}
            >
                {submitting ? 'Adding...' : 'Add exam slot'}
            </button>
        </form>
    )
}
